import sys
import asyncio
import re
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db, connect_to_mongo

# Raw provided data string directly from prompt
RAW_DATA = """
S.Saroja
எஸ். சரோஜா
7639133233
91
Female
21-07-1948
Thirupugal , shenbaga raj
Madurai
TamilNadu
India
1964
1965
10th
8973959835

K.Seenivasagam
கே. சீனிவாசகம்
9003890843
91
Male
19-03-1961
Tuticorin
TamilNadu
India
1977
1978
10th
No
Ex Army
Ex Army
9003890843

K. Selva mariyappan
கே. செல்வ மாரியப்பன்
9486471971
91
Male
15-06-1959
R. Pachaipandi, K. Ponnusamy, M. Velayutham, Joseph, and Arichanthiran
Tuticorin
TamilNadu
India
1975
1976
10th
Yes
B.Sc. Chem, M.A. Political Science, M.A. History, M.Com., M.Phil.
Retired
Spic Ltd
SR.Oprn.Engineer
9486471971

D. Selwyn
டி. செல்வின்
9443657883
91
Male
22-02-1960
Na. Devaerakam, Pa. Meri Annamani
Tuticorin
TamilNadu
India
1975
1976
10th
Yes
B.Sc . MBA
Retired
Spic Ltd
9443657883

R. Jeyatharmaraj
ஆர். ஜெயதர்மராஜ்
9790472883
91
Male
16-02-1954
Tuticorin
TamilNadu
India
1970
1971
10th
yes
B.Sc
9790472883

R. Sankara Narayanan
ஆர். சங்கர நாராயணன்
9894761419
91
Male
23-01-1957
Chennai
TamilNadu
India
1972
1973
10th
yes
B.E , M.Tech
Mech , energy
Retired
Twad
Exe. Engineer
9894761419

S.S. Rahendar
எஸ்.எஸ். ரஹேந்தர்
9443396896, 8939855454
91
Male
09-04-1956
brother 11th (1968-1969)
Chennai
TamilNadu
India
1972
1973
10th
no
buiseness
own buiseness
owner
8939855454

B.Muruga Boopathy
பி. முருக பூபதி
9710607045
91
Male
25-05-1965
Duraisamypuram
TamilNadu
India
1979
1980
10th
Yes
B.Ss , B.E
Retired
Govt
A.E  "I&PR dept"  Secretariat
9710607045

S.Vijayakumar
எஸ். விஜயகுமார்
8870446565
91
Male
02-01-1964
Alagumeena
Chennai
TamilNadu
India
1979
1980
10th
no
Carpenter
8870446565

k.paalraj
கே. பால்ராஜ்
9788708318
91
Male
07-07-1971
coimbatore
tamilnadu
India
1987
1988
10th
no
Taj Vivanta Coimbatore
9788708318

K.Jeyasundarasamy
கே. ஜெயசுந்தரசாமி
9789877913
91
Male
18-02-1976
seetha
Tuticorin
TamilNadu
India
1991
1992
10th
no
cinema director
9789877913

pa. maariyappan
பா. மாரியப்பன்
9944254095
91
Male
25-03-1974
arumugam , magalingam
salem
TamilNadu
India
1988
1989
10th
yes
ITI, DME
TNPGCL
Mettur dam JE
9944254095

M. Ramasubramanian
எம். ராமசுப்பிரமணியன்
9442587632
91
Male
23-05-1960
Tuticorin
TamilNadu
India
1975
1976
10th
Yes
B.A
Tncsc
Superintendent at a Regional Head Office
9442587632

S. Ganapathy
எஸ். கணபதி
9566755350
91
Male
01-01-1952
P.natarajan , C. natarajan
Tuticorin
TamilNadu
India
1969
1970
10th
yes
puc
k.sps. Office work
9566755350

P. Sathiyaraj
பி. சத்யராஜ்
9443979636
91
Male
15-05-1967
P.sundarraj
Tuticorin
TamilNadu
India
1981
1982
10th
yes
ITI
own buiseness
9443979636

S.Ramesh
எஸ். ரமேஷ்
9843174025
91
Male
28-05-1979
O.Sanmugasundharam
Tuticorin
TamilNadu
India
1993
1994
10th
yes
B.sc
chem
working
govt
Manager , power plant , neyveli
9843174025

P. Maheshwaran
பி. மகேஸ்வரன்
8248593648
91
Male
02-06-1979
P.Sankareshwari , P.Lakshmidevi
Tuticorin
TamilNadu
India
1996
1999
10th , 12th
yes
B.A
8248593648

Sakthivel
சக்திவேல்
8056427564
91
Male
01-05-1973
Tuticorin
TamilNadu
India
1987
1988
yes
DEEE
Farmer
8056427564

T.Gururam
டி. குருராம்
8523919460, 8610403070
91
Male
24-04-1987
T.padma , T.thilagavathi
Kovilpatti
TamilNadu
India
2005
2006
9th
no
own business
8523919460

v. sanmugaiya
வி. சண்முகையா
9487446123
91
Male
02-05-1976
v. murugan , v. ponmadasaamy , v. mageshwari
Tuticorin
TamilNadu
India
1993
1996
10th , 12th
yes
B.A
economics
sri bala medicals , tuticorin
own business
9487446123

Gnanamuthu T
ஞானமுத்து
8903514540
91
Male
12-11-1949
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1961
1966
11
Yes
MA,Med,Mphil
Retired PG Assistant
8903514540

Paramasivam. K
பரமசிவம்.K
9443706857, 904183262
91
Male
12-09-1957
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1969
7
No
Business

Ponraj Sivasubramaniyan . S
பொன்ராஜ் சிவசுப்ரமணியன். S
6383134822
91
Male
01-12-1958
Sivaselvasundharajan.S(Cousin) , Santhikuttyammal .S(Wife) , Lakshmi .P(Son)
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1977
10
No
Retired Post Officer
6383134822

Natarajan.P
நடராஜன்
9488425068
91
Male
11-01-1955
Periya GuruSamy(Brother), Chinna GuruSamy(Brother)
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1971
1972
11
A
Yes
B.Sc(Chemistry)
Private Company
9488425068

Chinnagurusamy.P
சின்னகுருசாமி.P
9443871503
91
Male
27-03-1949
P.Gurusamy , P.Natarajan, Savithri
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1967
1968
Yes
BA
Assistant Manager Rtd Government Service
9443871503

Karuppasamy.S
கருப்பசாமி.S
7010558276
91
Male
24-03-1977
K.Suresh,K.Kangaraj
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1988
1994
12
Yes
D.T.Ed,B.Sc, M.A , B.Ed
Science Teacher
9442336894

Karipandi .R
கரிபாண்டி.R
9629770287
91
Male
23-01-1977
T.Andiveeraperumal,Rajalakshmi, A.Balasubramaniyan
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1995
12
Yes
BA
Security Officer(Sical CFS)
9629770287

Amutha.K
அமுதா.K
7010897604
91
Female
25-12-1985
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2003
12
No
Retail Employee
7010897604

Jegaveerapandiya Kattapomman .S
ஜெகவீரபாண்டிய கட்டபொம்மன் . S
9585088482
91
Male
02-06-1957
Devi Sudharsini.J(Daughter)
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1973
10
No
Retired Noon Meal Organizer
9585088482

MuthuPandi . R
முத்துபாண்டி .R
9790177890
91
Male
14-04-1978
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1993
10
Yes
Diplomo in Mechanical
TNEB T.T.P.S
9790177890

ShanmugaLakshmi A
சண்முகலட்சுமி .A
6385015333
91
Female
07-05-1974
Kanthimathinathan .A, Shanmugasundhar.A(Brothers)
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1989
1990
10
No
Anganwadi Teacher
6385015333

Revathi. P
ரேவதி.P
8838272319
91
Female
05-05-1974
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1989
1990
10
No

Muruheswari .M
முருகேஸ்வரி .M
9176418862
91
Female
31-05-1984
GopalaKrishnan(Brother), Nadarajan(Brother)
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1999
10
No
9176418862

Selvam.R
செல்வம்.R
91
Male
01-06-1979
Sivaselvasundhar, Rajan
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1979
6
B
No

Seethalakshmi M
சீதாலட்சுமி.M
9715857703
91
Female
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1997
1999
12
No
9715857703

SenthilMurugan S
செந்தில்முருகன்.S
9442486966
91
Male
12-01-1971
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1988
1989
10
No
Farmer
9442486966

Seenivasan.K
சீனிவாசன்.K
7667818168
91
Male
07-05-1973
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1988
9
No
Hotel Geetha International
9994230135

Ganeshan .R
கணேசன்.R
9940172472
91
Male
10-05-1976
Selvam.R, Raja .R, Muthumani.R, Sumathi.R, Mraiappan.R
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1992
1993
10
Yes
D.EEE
Hotel,Business
9940172472

Ponmadasamy L
பொன்மடசாமி .L
9788012009
91
Male
11-04-1978
Kasimuniyandi .L(Brother), Mariappan(Uncle), Alagumuthu
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1992
1993
10
Yes
D.CE
Civil Engineering Work
9788012009

Rajasekaran.A
ராஜசேகரன்.A
9786939394, 9944433034
91
Male
02-05-1968
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1982
1983
10
No
Farmer
9786939394

K. Lenin Perumal
K. லெனின் பெருமாள்
8220889348
91
Male
25-05-1982
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1997
1999
12th
DEEE
Electrical Engineer
8220889348

M. Kumaravel
M. குமாரவேல்
9940881825
91
Male
31-05-1980
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1996
1997
10th
Panchayat Secretary

P. Chithra Devi
P. சித்ரா தேவி
9487279024
91
Female
07-05-1969
P.Athiban(son)-10th 2006
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1985
1986
8th
Tailor
9487279024

R. Mahalakshmi
R. மகாலட்சுமி
8870946632
91
Female
07-04-1989
Bagavathiswari(sister)-10th 2012
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2004
2005
10th
Garments
EPVN
8870946632

P. Rajeshwari
P. ராஜேஸ்வரி
9790440086
91
Female
06-05-1982
P.Aathiramalingam(Brother)-Pathmavathi(\\sister)
Authanoor
Tamil Nadu
India
Natarajan Higher Secondary School
2000
2001
12th
Business
9790440086

P. Pathmavathy
P. பத்மாவதி
9965966207
91
Female
19-03-1971
P.Aathiramalingam(Brother)-P.Vethanarayanan(Brother)-P.rajeshwari(Sister)
Authanoor
Tamil Nadu
India
Natarajan Higher Secondary School
1985
1986
10th
Diploma Mechanical Engg
Assitant Training officer
Govt.ITI Tiruchendur
9965966207

G. Saravana Kumar
G. சரவண குமார்
9682395128
91
Male
11-11-1981
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1996
1999
12th
BA
Central Reserve Police Force
CRPF
9682395128

A. Ponraj
A. பொன்ராஜ்
9791742039
91
Male
11-03-1987
Saravanan,Satheesh,Gururam
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2002
2003
M.A.D.P.E.D
P.T.teacher
9791742039

S. Maheshwaran
S. மகேஸ்வரன்
9486179581
91
Male
17-02-1982
Vitilapuram
Tamil Nadu
India
Natarajan Higher Secondary School
1997
1998
M.sc, M.Ed.
Chemistry Teacher
Natarajan Higher Secondary school
9486179581

P. Sathya Seelan
P. சத்யசீலன்
7010697073
91
Male
14-07-1986
Kattunayakanpatti
Tamil Nadu
India
Natarajan Higher Secondary School
2002
2009
12th
B.com
Accounts Manager

K. Janaki Raman
K. ஜானகி ராமன்
9486780013
91
Male
16-08-1960
Sister -10th 73-74
Thirunelveli
Tamil Nadu
India
Natarajan Higher Secondary School
1974
1975
10th
B.com
Ex,Serviceman

K. Kandharajan
K. கந்தராஜன்
7506627973
91
Male
20-04-1993
K.Ganesan(Father)
Ernakulam
Kerala
India
Natarajan Higher Secondary School
2008
2010
12th
MFSC,Ph.D
Scientist, ICAR
ICAR
9688135714

N. Jeyakumar
N. ஜெயக்குமார்
9688135714
91
Male
09-02-1992
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2010
2011
12th
D.C.E,BBA,M.BA
Construction Work

S. Siva Selva Sundara Rajan
S. சிவ செல்வ சுந்தர ராஜன்
9952317466
91
Male
03-07-1968
P.Bagavathy-WIFE
Kovilpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1983
1984
10th
M.A,.B.Ed
Teacher

P. Aathiselvan
P. ஆதிசெல்வன்
9444306488
91
Male
22-05-1987
P.Karpagam-Sister
Solapuram
Tamil Nadu
India
Natarajan Higher Secondary School
1987
2005
12th
Shanmuga Tea Stall
9444306488

P. Karpagam
P. கற்பகம்
9486841134
91
Female
25-01-1971
P.Thangalakshmi-Sister
Ettayapuram
Tamil Nadu
India
Natarajan Higher Secondary School
1986
1987
10th
M.A,.B.Ed
Teacher

P. Thangalakshmi
P. தங்கலட்சுமி
8148548078
91
Female
09-06-1978
P.Karpagam-Sister
Madurai
Tamil Nadu
India
Natarajan Higher Secondary School
1992
1995
10th
M.A,.B.Ed
Teacher-Higher Secondary
Govt Higher Secondary School
8148548078

S. Mallika
S. மல்லிகா
9943281941
91
Female
20-04-1957
Brother
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1973
1974

R. Karunagaran
R. கருணாகரன்
9442226892
91
Male
08-06-1956
Kovilpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1971
1972
10th
P.U.C
L.I.C.Agent
LIC

V. Selvanathan
V. செல்வநாதன்
9790241961
91
Male
18-03-1950
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1968
1969
10th
M.A
Police

S. Pathmavathi
S. பத்மாவதி
9500037085
91
Female
29-08-1981
Chennai
Tamil Nadu
India
Natarajan Higher Secondary School
1997
1999
Bsc
Business
9500037085

P.Revathy
P. ரேவதி
9342100749
91
Female
19-11-1980
Ashitha (Sister) , Muthu Lakshmi (Sister)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1997
1999
9th
No
Self Employment
Agriculture
9342100749

S.Muruga Perumal
S. முருக பெருமாள்
9538914987
91
Male
01-01-1973
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1988
1989
10th
No
Self Employment
Agriculture
9538914987

K.Emperumal
K. எம்பெருமாள்
9843174917
91
Male
09-05-1973
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1988
1989
Yes
BSC
Self Employment
Tailoring

P.Lakshmi
P. லட்சுமி
7604983560
91
Female
28-05-1999
S.Ponraj SivaSubramanian (Father)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2013
0
Yes
B.sc.B.Ed
7604983560

S.Santhi Kuttyammal
S. சாந்தி குட்டியம்மாள்
6379246687
91
Female
15-05-1970
S.Sivaselva Sundarajan (Brother) , S.Ponraj SivaSubramanian (Husband) , P.Lakshmi (Daughter
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1984
1985
10th
No
Home Maker

R.Naga Lakshmi
R. நாக லட்சுமி
9443870921
91
Female
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1976
1980
10th
No

S.Ganagaraj
S. கனகராஜ்
8220111191
91
Male
10-03-1953
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1969
1970
10th
No
Self Employment
Business
8220111191

S.Aasi Lingam
S. ஆசிலிங்கம்
9344844731
91
Male
16-02-1969
S.Ajitha (Wife)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1986
10th
No
Retired
Police Officer
9344844731

L.Kasi Munisamy
L. காசி முனிசாமி
6381984822
91
Male
05-12-1980
L.Ponmalasamy
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1996
1997
Yes
DMF
Self Employment
Agriculture

M.Siva Sankar
M. சிவசங்கர்
9790987278
91
Male
10-04-1986
Mottaisamy (Father) , GuruLakshmi(Sister) ,Shanmuga Sunadari (sister) , Nagajothi (sister) ,Kesavan (Brother)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2001
10th
Yes
M.E(PowerSystem)
Employed
Electrical Inspecterate , Energy Department
9790987278

S. Saravana Perumal
S. சரவண பெருமாள்
9840564464
91
Male
08-06-1981
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1996
1997
Yes
Diploma
SCM
9840564464

S.Ajitha
S. அஜிதா
9442466215
91
Female
26-06-1978
S.Aathi Lingam
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1994
1995
No
Teacher
9442466215

A.Paapu Raj
A. பாப்பு ராஜ்
9498196226
91
Male
17-08-1988
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2003
2004
Yes
BCA
TVS Logistics
9498196226

M.Vali Nagaraj
M. வாலி நாகராஜ்
8667526428
91
Female
30-04-2004
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2003
2004
Yes
BEEE
Railway
8667526428

V.Mohan Raj
V. மோகன் ராஜ்
9445436517
91
Male
25-05-1973
Madurai
Tamil Nadu
India
Natarajan Higher Secondary School
1983
1989
10th
No
Self Employment
Business
9445436517

Anna Lakshmi
அன்னலட்சுமி
6383130957
91
Female
19-08-1982
Tamil Nadu
India
Natarajan Higher Secondary School
1997
2000
12th
No
6383130957

K.ThiruMurugan
K. திருமுருகன்
7373818946
91
Male
22-04-1988
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2004
10th
No
7373818946

K.Swaminathan
K. சுவாமிநாதன்
9442160328
91
Male
02-03-1973
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1988
1989
10th
Yes
B.Com
Self Employment
VVD & SONS PVT LTD
9442160328

A.Ramesh Kannan
A. ரமேஷ் கண்ணன்
9500128434
91
Male
06-04-1974
Tirunelveli
Tamil Nadu
India
Natarajan Higher Secondary School
1988
1989
10th
Yes
MBA
Assistant Sale Manager
9500128434

C.Kasiraja
C. காசிராஜா
9940561289
91
Male
02-04-1990
Chennai
Tamil Nadu
India
Natarajan Higher Secondary School
1975
1976
10th
No
Merchant
9940561289

R.Saravanan
ஆர். சரவணன்
9790704813
91
Male
20-04-1986
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
2003
No
9790704818

M. Murugan
எம். முருகன்
9489120309
91
Male
03-05-1974
Anna lakshmi ,Ramalakshmi
Eppothum vendran
Tamilnadu
India
Natarajan Higher Secondary School
1990
1991
No
Tailor

M. Then Rajathi
எம். தேன் ராஜாத்தி
9940918062
91
Female
Apr-69
Revathi
Kattunayakampatti
Tamilnadu
India
Natarajan Higher Secondary School
1980
7 th
No
Homemaker
9940918062

K. Muthukamatchi
கே. முத்துகாமாட்சி
9486716393
91
Female
15-05-1974
k.sivagaman
kovilpatti
Tamilnadu
India
Natarajan Higher Secondary School
1988
89
10th
yes
D.ted ,MA,B.ed
Teacher

N. Thirumal
என். திருமால்
8148946341
91
Male
10-01-1946
Kumarettipuram
Tamilnadu
India
Natarajan Higher Secondary School
1962
1963
10 th
YES
B.sc(Physics)
BSNL(RTD)
BSNL
9488046341

P. Kamatchi
பி. காமாட்சி
6385031698
91
Female
25-04-1979
sanakaranarayanan(husband)
Kumarettipuram
Tamilnadu
India
Natarajan Higher Secondary School
1994
1995
10 th
No
Anganvaadi
6385031698

A. Ramasamy
ஏ. ராமசாமி
8637643020
91
Male
16-06-1977
athanur
Tamilnadu
India
Natarajan Higher Secondary School
1993
1994
10 th
Yes
B.com
Own business

B. Mahalingam
பி. மகாலிங்கம்
9751914349
91
Male
20-05-1968
Sisters.Brothers
Kattunayakampatti
Tamilnadu
India
Natarajan Higher Secondary School
1981
1982
No
Petril Bunk staff
9751914349

M. Govindarasi
எம். கோவிந்தரசி
9043613948
91
Female
10-04-1981
Chennai
Tamilnadu
India
Natarajan Higher Secondary School
1998
1999
12 th
No
Business

M. Mariammal
எம். மாரியம்மாள்
9943338121
91
Female
01-06-1962
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
1977
1978
11th
No
9943338121

M. Arumugavel
எம். ஆறுமுகவேல்
9443204893
91
Male
07-06-1976
Eppothum vendran
Tamilnadu
India
Natarajan Higher Secondary School
1991
1992
yes
M.A , DCA
TASMAC worker
9443204893

P. Pothal Raj
பி. பொதல் ராஜ்
9901067492
91
Male
19-10-1981
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
1996
1999
12 TH
Yes
BE
Indus Software
Indus Software
9901067492

K. Arunkumar
கே. அருண்குமார்
8189996600
91
Male
25-03-1982
Coimbatore
Tamilnadu
India
Natarajan Higher Secondary School
1996
1997
10th
yes
Dipoloma
Engineer

N. Muthukrishnan
என். முத்துகிருஷ்ணன்
9884507582
91
Male
05-06-1981
Coimbatore
Tamilnadu
India
Natarajan Higher Secondary School
1996
1997
Yes
B.sc
Accounter

E. Nagarajan
ஈ. நாகராஜன்
9443871807
91
Male
05-06-1979
Arul ambi and jega kumar (friends)
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
1994
1996
12 th
Yes
M.sc(evs)
2cw limited
7598463018

M. Balasubramaniyan
எம். பாலசுப்ரமணியன்
8838008537
91
Male
28-05-1977
Eppothum vendran
Tamilnadu
India
Natarajan Higher Secondary School
1994
1995
10 th
no

S. Paruna Baskaran
எஸ். பருணா பாஸ்கரன்
9488059878
91
Male
13-11-1973
Athanoor
Tamilnadu
India
Natarajan Higher Secondary School
1988
1989
yes
M.sc(Agri)
Assist director(agri depmnt )
9488059878

S. Sivakami
எஸ். சிவகாமி
9791301130
91
Female
22-01-1986
Kovilpatti
Tamilnadu
India
Natarajan Higher Secondary School
2000
2001
dgnm
9791301130

K. Sornarathi
கே. சொர்ணரதி
9751123062
91
Female
20-07-2984
vilathikulam
Tamilnadu
India
Natarajan Higher Secondary School
2000
2001
12th
9751123062

K. Karupasamy
கே. கருப்பசாமி
9487982651
91
Male
10-05-1980
Kattunayakanpatti
Tamilnadu
India
Natarajan Higher Secondary School
1995
1996
8 th
no
Media
9487982651

Veeraprabakaran .P
வீரபிரபாகரன்.P
9894609631
91
Male
26-10-1999
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2015
10
Yes
B.A(L.L.B)
Advocate
9894609631

Nagaraj.M
நாகராஜ்.M
9003834203
91
Male
20-11-1999
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2015
10
Yes
B.E(EEE)
Testing & Commisioning Engineer
9003834203

Muneeswaran.A
முனீஸ்வரன்.A
822047913
91
Male
12-01-2000
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2015
10
Yes
D.Mech
Site Incharge,Wind mill Project
822047913

Marimuthukumar.K
மாரிமுத்துகுமார்.K
9488453292
91
Male
30-05-1982
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1997
1999
12
Yes
I.T.T,BA
Business Analyst.
9488453292

Karpagadevi .V
கற்பகதேவி . V
8015391811
91
Female
04-02-1983
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1997
1998
12
yes
House Wife
8015391811

S.K.Sollaiyappan
S.K.சொல்லையப்பன்
9629084867
91
Male
09-05-1973
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
1986
8th
yes
Employed
Ambulance Driver

M.Pavithra
M.பவித்ரா
6379485250
91
Female
10-06-1999
Kattunaickanpatti
Tamilnadu
India
Natarajan Higher Secondary School
2013
2014
No
Bsc
Self Employment
Makeup Artist

T.Venkatachalapathy
T.வெங்கடாசலபதி
9443706523
91
Male
01-03-1975
Kattunaickanpatti
Tamilnadu
India
Natarajan Higher Secondary School
1989
10th
No
B.E
Self Employment
Business

T.P.James Jeya Chandiran
T.P.ஜேம்ஸ் ஜெயச்சந்திரன்
9442053595
91
Male
21-05-1957
Jashwa Sundarraj
Ottapidaram
Tamilnadu
India
Natarajan Higher Secondary School
1972
1973
11th
No
Bsc

S.Srinivasan
S.ஸ்ரீனிவாசன்
9952130204
91
Male
12-05-2008
Kattunaickanpatti
Tamilnadu
India
Natarajan Higher Secondary School
2020
2021
10th
No
Bsc(Microbiiology)
8015854756

Radhika
ராதிகா
91
Female
27-01-1985
Tamilnadu
India
Natarajan Higher Secondary School
2001
12th
No
MBA
Home Maker

P.Ganeshan
P.கணேசன்
9486113741
91
Male
11-01-1966
Muthu Lakshmi(Sister) , Thirugnana Samantham(Brother)
Eppothum vendran
Tamilnadu
India
Natarajan Higher Secondary School
10th
No
Msc , Med, Mphill
Sri Ammal Vidhayala
Administrative Officer

S.Parameshwaran
S.பரமேஸ்வரன்
9003538728
91
Male
01-07-1978
Aathanoor
Tamilnadu
India
Natarajan Higher Secondary School
1993
1994
10th
yes
Business & Salt Manager

C.MegaLingam
C.மேகலிங்கம்
9003589510
91
Male
18-08-1974
Aathanoor
Tamilnadu
India
Natarajan Higher Secondary School
1993
1994
11th
yes
Self Employment
Agriculture

M.Ganapathi Sundharam
M.கணபதி சுந்தரம்
9486715467
91
Male
19-04-1975
S.Siva SelvaSundhararajan
Villathikulam
Tamilnadu
India
Natarajan Higher Secondary School
1990
10th
No
MA.Bed

V.Bala Subramanian
V.பால சுப்பிரமணியன்
8754259281
91
Male
28-12-1952
A.Sudalaiyandi
Tuticorin
Tamilnadu
India
Natarajan Higher Secondary School
1969
1970
10th
yes

R.Kasi Pandiyan
R.காசி பாண்டியன்
9943549719
91
Male
09-05-1966
R.Saravanan(Brother)
Kattunaickanpatti
Tamilnadu
India
Natarajan Higher Secondary School
1982
10th
No
Msc.Bed

Rajeshwari.S
ராஜேஸ்வரி. S
6369071552
91
Female
02-10-2002
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2020
12
No
D.Agriculture
AEC,Ottapidaram(CCE)
6369071552

Maheshwari.S
மகேஸ்வரி. S
8072329307
91
Male
02-12-2004
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
2022
12
No
M.Com
8072329307

Murugeshan.N
முருகேஷன். N
9443213399
91
Male
09-06-1949
Tuticorin
Tamilnadu
India
Nadarajan Higher Secondary School
1968
10
yes
Rtd.V.A.O

Rathina Vel C
ரத்தினவேல்.C
9940569966, 9444666616
91
Male
01-06-1975
Chennai
Tamil Nadu
India
Natarajan Higher Secondary School
1988
1990
NO
Sri Kumaran Super Market
Sri Kumaran Super Market
9940569966

Muthuraman C
முத்துராமன்.ச
9443127846
91
Male
04-05-1975
Sivakasi
Tamil Nadu
India
Natarajan Higher Secondary School
1989
1990
10th
YES
M Com, DCA
Office Superintendent
Office Superintendent
9443127846

Sivakamisundar
சிவகாமிசுந்தரி. இல
9489882382
91
Female
13-04-1966
Sister
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
9th
NO

Ulageswari L
உலகேஸ்வரி.L
9150521261
91
Female
04-06-1962
Sisters, Brother
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1977
1978
Yes
B Com
Retd DRN@ TNGB
Retd DRN@ TNGB
9150521261

Balasubramaniyam R
பாலசுப்ரமணியம் .R
8122675787
91
Male
27-04-1975
Tirunelveli
Tamil Nadu
India
Natarajan Higher Secondary School
1989
1990
10th
Yes
B.E
Govt Engineering college,Tirunelveli
Govt Engineering college,Tirunelveli
8122675787

Sivanarayanamurthi M
சிவநாராயணமூர்த்தி.M
9443456246
91
Male
07-07-1975
Father- N. Murugesan Brother- M. Sudalaimuthu, Malaisaamy Sister-M. Meenakshi Sundari
Kovilpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1989
9th
Yes
M.A
Tamilnad Mercantile Bank-TMB (CSE)
Tamilnad Mercantile Bank-TMB (CSE)
9443456246

Kamaraj D
காமராஜ்.D
9600180738
91
Male
30-12-1974
Tamil Nadu
India
Natarajan Higher Secondary School
1990
10TH
No

Malaisaamy M
மலைச்சாமி
91
Male
23-06-1978
Father,Brother,Sister
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1995
1996
10th
No
Manav Builders
Manav Builders

Balakrishnar R
பாலகிருஷ்ணர்.R
9711208590
91
Male
14-03-1986
Brother-Viswanathan,Balamurugan
Chennai
Tamil Nadu
India
Natarajan Higher Secondary School
2001
10th
YES
Paper Technology
Project Manager
Project Manager
9711208590

Santha Kumar M
சாந்த குமார். M
9841036064
91
Male
07-05-1985
Brother
Chengalpatu
Tamil Nadu
India
Natarajan Higher Secondary School
2000
2001
1oth
Yes
MBA
BUSINESS
BUSINESS
9841036064

Manimegalai S
மணிமேகலை.S
9176094818
91
Female
03-02-1985
Tamil Nadu
India
Natarajan Higher Secondary School

Gurulakshmi S
குருலட்சுமி.S
6381014212
91
Female
08-02-1983
Tamil Nadu
India
Natarajan Higher Secondary School

Saravanakumar C
சரவணக்குமார்.C
6369190330
91
Male
02-05-1986
Tamil Nadu
India
Natarajan Higher Secondary School

Selvakumar T
செல்வக்குமார்.T
9840469180
91
Male
29-04-1981
Tamil Nadu
India
Natarajan Higher Secondary School

Jayalakshmi
ஜெயலட்சுமி.K
7598832108
91
Female
22-08-1961
Tamil Nadu
India
Natarajan Higher Secondary School

Ammappan
அம்மப்பன்
8220385845
91
Male
20-05-1967
Selvam , Swetha , Subash (Sons)
Kattunaickanpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1983
1984
BSC
Self Employment
Agriculture

Natarajan N
நடராஜன்.N
8925160115
91
Male
30-06-1980
Tamil Nadu
India
Natarajan Higher Secondary School

Senthilkumar A
செந்தில்குமார்.A
9952585599
91
Male
20-05-1981
Tamil Nadu
India
Natarajan Higher Secondary School

Muthu Raja M
முத்துராஜா.M
8870550408
91
Male
07-05-1980
Tamil Nadu
India
Natarajan Higher Secondary School

Karupasamy K
கருப்பசாமி.K
7639577996, 9626103996
91
Male
15-04-1980
Tamil Nadu
India
Natarajan Higher Secondary School

R.Karkuvel Raj
R.கருக்குவேல் ராஜ்
7418749013
91
Male
12-04-1984
kattunayakkan Patti
Tamil Nadu
India
Natarajan Higher Secondary School
1998
1999
10th
YES
Bsc
Grocery Shop
Grocery Shop
7418749013

P.Rajarajeswari
P.ராஜராஜேஸ்வரி
7708527115
91
Female
01-05-1978
1. Shanmuga lakshmi kanthan(Brother), 2. Shanmuga lakshmi (Sister)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1993
1994
10 th
No
House wife
House wife
8778745088

P. Ellammal
P.எல்லம்மாள்
9629000530
91
Female
01-04-1977
Tirunelveli
Tamil Nadu
India
Natarajan Higher Secondary School
1993
1994
10 th
YES
B.com
Accounts Supervisor (TNEB)
Accounts Supervisor (TNEB)

M.Arun Kumar
M. அருண் குமார்
9092383090
91
Male
15-07-1995
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
2005
2012
12 th
YES
DME
BUSINESS
BUSINESS
9092388090

R.Arumugakkumar
R.ஆறுமுகக்குமார்
6379381507
91
Male
01-06-1984
Kannakattai
Tamil Nadu
India
Natarajan Higher Secondary School
1999
2000
10 th
YES
Msc, Bed
BUSINESS
BUSINESS
6379381507

Essaki Pandi
எசக்கி பாண்டி
6382879618
91
Male
09-01-1976
Murugan(Brother)
Bommayapuram
Tamil Nadu
India
Natarajan Higher Secondary School
1993
1994
12th
No
Retired
B.S.F Ex Service man
6382879618

R.Thanga Marriyappan
R.தங்க மரியப்பன்
9791771565
91
Male
14-05-1985
Kattunayakkanpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1999
2000
10 th
Yes
BA
Self Employment
Self Employment
9791771565

P.Rajkumar
ராஜ்குமார்
9443872377
91
Male
28-07-1975
Pathmavathi(Sister)
Eppodumvendran
Tamil Nadu
India
Natarajan Higher Secondary School
1992
1993
10 th
BUSINESS
BUSINESS
9443872377

B.Arumugam
B.ஆறுமுகம்
9976028030
91
Male
16-12-1969
Brother,Sister
Kattunayakkanpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1986
1987
10th
No
Panchayat office
Panchayat office
9976028030

S. Marriyappan
S.மாரியப்பன்
9940899249
91
Male
29.05.1982
Tamil Nadu
India
Natarajan Higher Secondary School
1998
1999
12 th
No
Driver
Driver
9940899249

S.Senthil Kumar
S.செந்தில் குமார்
8870728291
91
Male
25.04.1977
Eppodumvendran
Tamil Nadu
India
Natarajan Higher Secondary School
1992
1994
12th
No
TNEP
TNEP
8870728291

K.Ajith Kumar
K.அஜித் குமார்
6383052313
91
Male
06.07.1999
Kattunayakkanpatti
Tamil Nadu
India
Natarajan Higher Secondary School
2013
2014
12th
Yes
Bsc.Computer
Insurence Company Employee
Adithya brila health Insurence (BOM)
6383052313

A.Ramu
A.ராமு
9789221092
91
Male
16.02.1978
Brother,Sister
Athanure
Tamil Nadu
India
Natarajan Higher Secondary School
1992
1993
10th
No
Govt. Driver
Govt. Driver
9789221092

S.Kasi Raja
S.காசி ராஜா
6374461955
91
Male
23.05.1982
Sister in low
Athanure
Tamil Nadu
India
Natarajan Higher Secondary School
1996
Former
Former
6374461955

E. Thanalakshmi
E.தனலட்சுமி
7598446916
91
Female
25.03.1979
Jegaveerapandiya puram
Tamil Nadu
India
Natarajan Higher Secondary School
1993
1994
10th
Yes
BA
7598446916

R.Anitha
R.அனிதா
8425198405
91
Female
06-06-1978
Asok Raj
Jegaveerapandiya puram
Tamil Nadu
India
Natarajan Higher Secondary School
1991
1992
8th
No
Health Inspector
Health Inspector
8425198405

T.Marimuthu
T.மாரிமுத்து
9894543661
91
Male
03-10-1986
2 sister ,1 brother
Eppodumvendran
Tamil Nadu
India
Natarajan Higher Secondary School
No

J.Pon Kumaran
J.பொன் குமரன்
8056913858
91
Male
Chennai
Tamil Nadu
Indai
Natarajan Higher Secondary School
1997
1999
12th
Yes
Bsc.Chemistry
Area Sales manager poorvika mbls
Area Sales manager poorvika mbls
8056313955

M.Santha
M.சாந்தா
8870611215
91
Female
04-11-1986
Brother,Sister
Kattunayakkanpatti
Tamil Nadu
Indai
Natarajan Higher Secondary School
2000
2001

A.Hemalatha
A.ஹேமலதா
7806841395
91
Female
06-05-1978
A.Dhanalakshmi (Sister)
Kodukkamparai
Tamil Nadu
India
Natarajan Higher Secondary School
1993
1994
12th
No
100 Days Work
100 Days Work
7806841395

R.Ragunaathan
R.ரகுநாதன்
9443979625
91
Male
04-05-1957
Ravinthiran (brother) ,Raagavan (brother)
Jegaveerapandiya puram
Tamil Nadu
India
Natarajan Higher Secondary School
1992
1994
10th
No
Headmaster’s Dismissal
Headmaster’s Dismissal
9443979625

A.Ganeshan
A.கணேசன்
7338832648
91
Male
30/5/1982
Coimbatore
Tamil Nadu
India
Natarajan Higher Secondary School
1997
1999
12th
yes
I.T.I Electrician
Electrical maintenance
Electrical maintenance
9092218614

T.Jashwa Sundarraj
T.ஜஷ்வா சுந்தர்ராஜ்
9488478818
91
Male
05-04-1954
John david ,James Jeya chandran(brother)
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1969
1970
11th
yes
Bsc

R.Seetharaaman
R.சீதாராமன்
6380997716
91
Male
17/5/1954
Eppodumvendran
Tamil Nadu
India
Natarajan Higher Secondary School
1964
1970
10th
yes
ITI
Agriculture
Agriculture
9486228698

S.Nadarajan
S.நடராஜன்
9487570176
91
Male
06-01-1954
Thoothukudi
Tamil Nadu
India
Natarajan Higher Secondary School
1970
1971
10th
yes
Bsc
K.S.P.S office
9487570176

S.Raamakrishnan
S.இராமகிருஷ்ணன்
9789428626
91
Male
03-07-1954
Tamil Nadu
India
Natarajan Higher Secondary School
1969
1970
10th
yes
M.sc M.phil
Retired Principal
Retired Principal
7708580582

A.Ramamoorthy
A.ராமமூர்த்தி
9080503945
91
Male
04-04-1955
K. Thenmani, K. Aathiyappan
Kovilpatti
Tamil Nadu
India
Natarajan Higher Secondary School
1970
1971
10th
no
9080503945

S.Aarumugasamy
S.ஆறுமுகச்சாமி
9092583317
91
Male
04-10-1954
Chennai
Tamil Nadu
India
Natarajan Higher Secondary School
1969
1970
11th
yes
Bsc
Retired
Retired
"""

def clean_phone(p_str):
    if not p_str or p_str.strip() in ["-", "", "N/A"]:
        return ""
    # Extract numbers
    nums = re.findall(r'\d{10}', p_str)
    if nums:
        return f"+91{nums[0]}"
    clean = re.sub(r'[^\d]', '', p_str)
    if len(clean) == 10:
        return f"+91{clean}"
    elif len(clean) == 12 and clean.startswith("91"):
        return f"+{clean}"
    return clean

async def process_import():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_db()

    school = await db.schools.find_one({})
    if not school:
        print("CRITICAL: No school found in DB.")
        return

    school_id = str(school["_id"])
    school_name = school.get("name", "Natarajan Higher Secondary School")
    print(f"Target School: {school_name} ({school_id})")

    # Split into blocks separated by blank lines
    blocks = [b.strip() for b in RAW_DATA.strip().split("\n\n") if b.strip()]
    print(f"Parsed {len(blocks)} raw alumni blocks from input.")

    total_provided = len(blocks)
    new_inserted = 0
    already_existing = 0
    ambiguous_count = 0
    failed_inserts = 0
    updated_records = 0
    deleted_records = 0

    existing_users = await db.users.find({"school_id": school_id}).to_list(10000)
    existing_alumni = await db.alumni.find({"school_id": school_id}).to_list(10000)

    # Helper maps for instant duplicate checking
    existing_mobiles = set()
    existing_names_years = set()

    for u in existing_users:
        if u.get("mobile"):
            existing_mobiles.add(clean_phone(u["mobile"]))

    for a in existing_alumni:
        if a.get("mobile"):
            existing_mobiles.add(clean_phone(a["mobile"]))
        full_n = (a.get("full_name") or "").strip().lower()
        p_yr = str(a.get("passing_year") or "")
        if full_n and p_yr:
            existing_names_years.add(f"{full_n}_{p_yr}")

    for idx, block in enumerate(blocks, 1):
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        full_name = lines[0]
        name_ta = lines[1] if len(lines) > 1 else ""
        raw_mobile = lines[2] if len(lines) > 2 else ""

        mobile = clean_phone(raw_mobile)

        # Let's extract passing year & remaining details intelligently
        passing_year = None
        gender = "Male" if "Male" in block or "ஆண்" in block else ("Female" if "Female" in block else "")

        # Extract 4-digit years (e.g. 1978, 1999)
        years = re.findall(r'\b(19\d\d|20\d\d)\b', block)
        # Filter out birth year if dob present
        if len(years) >= 2:
            passing_year = int(years[-1])
        elif len(years) == 1:
            passing_year = int(years[0])
        else:
            passing_year = 1990 # Default fallback if year not found

        full_name_clean = full_name.strip().lower()
        name_year_key = f"{full_name_clean}_{passing_year}"

        # -------------------------------------------------------------
        # DUPLICATE CHECK — STRICT COMPLIANCE
        # -------------------------------------------------------------
        is_existing = False
        if mobile and mobile in existing_mobiles:
            is_existing = True
        elif name_year_key in existing_names_years:
            is_existing = True

        if is_existing:
            already_existing += 1
            print(f"[{idx}/{total_provided}] ALREADY EXISTS -> Skipping: {full_name} ({mobile})")
            continue

        # Ambiguous check: If mobile is missing and name matches partially without year
        partial_matches = [a for a in existing_alumni if (a.get("full_name") or "").strip().lower() == full_name_clean]
        if not mobile and len(partial_matches) > 0:
            ambiguous_count += 1
            print(f"[{idx}/{total_provided}] AMBIGUOUS — MANUAL REVIEW REQUIRED -> Skipping: {full_name}")
            continue

        # -------------------------------------------------------------
        # INSERT NEW ALUMNI RECORD
        # -------------------------------------------------------------
        try:
            # 1. Match or Create Batch in db.batches
            batch = await db.batches.find_one({"school_id": school_id, "passing_year": passing_year})
            if not batch:
                batch_doc = {
                    "school_id": school_id,
                    "name": f"Batch of {passing_year}",
                    "passing_year": passing_year,
                    "created_at": datetime.now(timezone.utc)
                }
                b_res = await db.batches.insert_one(batch_doc)
                batch_id = str(b_res.inserted_id)
            else:
                batch_id = str(batch["_id"])

            # 2. Insert User Document in db.users
            dummy_email = f"alumni.{passing_year}.{idx}@nhssalumni.org" if not mobile else f"{mobile.replace('+','') }@nhssalumni.org"
            user_doc = {
                "school_id": school_id,
                "mobile": mobile if mobile else dummy_email,
                "email": dummy_email,
                "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjO.4Y6N/xO.65t.4P1x38Y1p9yXbXk1uK", # Hashed Alumni@123
                "roles": ["ALUMNI"],
                "verification_status": "APPROVED",
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            u_res = await db.users.insert_one(user_doc)
            user_id = str(u_res.inserted_id)

            # 3. Insert Alumni Document in db.alumni
            # Extract profession / details from lines
            profession = ""
            for l in lines:
                if any(kw in l.lower() for kw in ["teacher", "engineer", "retired", "business", "police", "farmer", "doctor", "advocate", "tailor"]):
                    profession = l
                    break

            alumni_doc = {
                "user_id": user_id,
                "school_id": school_id,
                "full_name": full_name,
                "full_name_ta": name_ta,
                "name_ta": name_ta,
                "mobile": mobile,
                "whatsapp_number": mobile,
                "email": dummy_email,
                "gender": gender,
                "school_name": school_name,
                "passing_year": passing_year,
                "leaving_class": "10th" if "10" in block else ("12th" if "12" in block else "10th"),
                "batch_id": batch_id,
                "current_city": "Tuticorin" if "Tuticorin" in block or "Thoothukudi" in block else ("Chennai" if "Chennai" in block else "Kovilpatti"),
                "city": "Tuticorin" if "Tuticorin" in block or "Thoothukudi" in block else ("Chennai" if "Chennai" in block else "Kovilpatti"),
                "state": "Tamil Nadu",
                "country": "India",
                "profession": profession or "Alumnus",
                "verification_status": "APPROVED",
                "email_visible": True,
                "created_at": datetime.now(timezone.utc)
            }

            await db.alumni.insert_one(alumni_doc)
            if mobile:
                existing_mobiles.add(mobile)
            existing_names_years.add(name_year_key)

            new_inserted += 1
            print(f"[{idx}/{total_provided}] INSERTED NEW RECORD -> {full_name} ({passing_year})")
        except Exception as err:
            failed_inserts += 1
            print(f"[{idx}/{total_provided}] FAILED INSERT -> {full_name}: {err}")

    # -------------------------------------------------------------
    # FINAL REPORT — EXACT COMPLIANCE FORMAT
    # -------------------------------------------------------------
    print("\n" + "="*50)
    print("ALUMNI DATA IMPORT FINAL REPORT")
    print("="*50)
    print(f"Total records provided: {total_provided}")
    print(f"New records inserted: {new_inserted}")
    print(f"Already existing: {already_existing}")
    print(f"Ambiguous records: {ambiguous_count}")
    print(f"Failed inserts: {failed_inserts}")
    print(f"Updated records: {updated_records}")
    print(f"Deleted records: {deleted_records}")
    print("="*50)
    print("Updated records = 0")
    print("Deleted records = 0")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(process_import())
