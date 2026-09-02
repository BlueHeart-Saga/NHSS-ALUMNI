import asyncio
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("feed_rank_holders")

RAW_DATA = """
10|M.Murugesan|மூ. முருகேசன்|1963|429/500
10|A.K.Ravindran|ஆ.க. ரவீந்திரன்|1964|397/500
10|R.Sarguna Pandi|இரா. சற்குணபாண்டி|1965|394/500
10|A.Pachaiya|ஆ. பச்சையா|1966|511/500
10|P.Sokkalingam|பொ. சொக்கலிங்கம்|1967|401/500
10|R.Elangovan|இரா. இளங்கோவன்|1968|427/500
10|M.Kadakarai Thangam|மா. கடற்கரைத்தங்கம்|1969|457/500
10|S.Arumuga Samy|சி. ஆறுமுகச்சாமி|1970|436/500
10|M.Velayutham|மு. வேலாயுதம்|1971|438/500
10|P.Bala Kirutinan|பெ. பால கிருட்டினன்|1972|481/500
10|S.Vel Vasagam|சு. வேல் வாசகம்|1973|478/500
10|V.Veera Kesavan|வீ. வீரகேசவன்|1974|441/500
10|S.Magimai Raja|ச. மகிமைராசா|1975|476/500
10|T.Selvan|தே. செல்வன்|1976|470/500
10|M.Anna Malai|மு. அண்ணாமலை|1977|443/500
10|K.Bala Murugan|க. பாலமுருகன்|1978|388/500
10|M.Kamalakannan|ம. கமலக் கண்ணன்|1978|345/500
10|E.L.ArulSingh|இ.லி. அருள்சிங்|1979|386/500
10|P.Muruga Boopathi|பா. முருக பூபதி|1980|360/500
10|S.Victor Resinald|சே. விக்டர் ரெசினால்டு|1981|408/500
10|P.Sathya Rasan|பொ. சத்தியராசன்|1982|371/500
10|K.S.S.Chandira Rajan|சோ.சி.செ. சந்திரராஜன்|1983|433/500
10|K.Murukesan|க. முருகேசன்|1984|452/500
10|K.Raga Seelan|கு. இராக சீலன்|1985|398/500
10|T.Bala Saraswathi|தா. பால சரசுவதி|1986|411/500
10|S.Senthil Kumar|சீ. செந்தில் குமார்|1987|426/500
10|R.Thangamani|இரா. தங்கமணி|1988|410/500
10|S.Paruna Baskaran|சி. பருன பாஸ்கரன்|1989|430/500
10|M.Ganapathi Sundaram|ச. கணபதி சுந்தரம்|1990|419/500
10|A.Mariyappan|ஆ. மாரியப்பன்|1991|377/500
10|K.Jawahar Kumar|க. ஜவஹர் குமார்|1992|452/500
12th|L.Lingaiya|L. லிங்கையா|1993|943/1200
10|L.SivaKaman|K. சிவகாமன்|1993|454/500
12th|E.Jeya Chandran|E. ஜெயச்சந்திரன்|1994|1062/1200
10|S.Sharmila|S. சர்மிளா|1994|429/500
12th|C.Kaali|C. காளி|1995|1042/1200
10|M.Karpagavali|M. கற்பகவல்லி|1995|454/500
12th|R.Selvam|R. செல்வம்|1996|1004/1200
10|N.Muthu Lakshmi|N. முத்து லட்சுமி|1996|444/500
12th|M.Karpagavali|M. கற்பகவல்லி|1997|1059/1200
10|S.Sankar Raman|S. சங்கர் ராமன்|1997|441/500
12th|N.Muthu Lakshmi|. N. முத்துலட்சுமி|1998|1120/1200
10|C.Gnanasekaran|C. ஞானசேகரன்|1998|454/500
10|S.Murukesan|ச. முருகேசன்|1999|450/500
12th|S.Harihara Sutha|செ. ஹரிஹர சுதா|1999|1024/1200
10|P.Prabhu|பா. பிரபு|2000|452/500
12th|S.ParavathaRaj|சி. பர்வதராஜ்|2000|1065/1200
10|M.Siva Sankar|M. சிவசங்கர்|2001|465/500
12th|S.Kalai Madasamy|S. காளைமாடசாமி|2001|1089/1200
10|S.Mercilin Geetha|S. மெர்சிலின் கீதா|2002|440/500
12th|M.Prema|M. பிரேமா|2002|1075/1200
12th|O.Jyothi|O. ஜோதி|2003|1140/1200
10|R.Rajkumar|R. ராஜ்குமார்|2003|457/500
12th|P.Muthuvijayan|P. முத்துவிஜயன்|2004|1032/1200
10|R.Raja|R. ராஜா|2004|453/500
12th|R.Rajkumar|R. ராஜ்குமார்|2005|1111/1200
10|U.uthanduraman|U. உத்தண்டுராமன்|2005|458/500
12th|R.Raja|R. ராஜா|2006|993/1200
10|R.Selvarani|R. செல்வராணி|2006|456/500
12th|S.Sangeetha|S. சங்கீதா|2007|1070/1200
10|P.Ramalingam|P. ராமலிங்கம்|2007|423/500
12th|P.Saravanakumar|P. சரவணக்குமார்|2008|1020/1200
10|G.Kandharajan|G. கந்தராஜன்|2008|477/500
12th|K.Maniraj|K. மணிராஜ்|2009|961/1200
10|e.Venkatraman|C. வெங்கட் ராமன்|2009|456/500
12th|G.Kandharajan|G. கந்தராஜன்|2010|1070/1200
10|S.Kamaraj|S. காமராஜ்|2010|451/500
12th|V.Madhankumar|.V. மதன்குமார்|2011|1098/1200
10|P.Indra|.P. இந்திரா|2011|472/500
12th|A.Kavitha|A. கவிதா|2012|1013/1200
10|C.Rajmohan|C. ராஜ்மோகன்|2012|473/500
12th|P.Dhana Lakshhmi|P. தனலட்சுமி|2013|1027/1200
10|C.Surya|C. சூர்யா|2013|484/500
"""

async def run():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    school_id = "6a911868ce252b2a8047455d"
    
    await db.rank_holders.delete_many({"school_id": school_id})
    logger.info("Deleted existing rank holders for school %s", school_id)
    
    docs = []
    now = datetime.now(timezone.utc)
    for line in RAW_DATA.strip().split('\n'):
        if not line.strip(): continue
        parts = line.split('|')
        cls_std, name_en, name_ta, year, marks = parts
        
        # Calculate percentage
        try:
            obt, max_m = map(int, marks.split('/'))
            perc = f"{(obt/max_m)*100:.1f}%"
        except Exception:
            perc = ""
            
        std_fmt = "10th SSLC" if "10" in cls_std else "12th HSC"
        ach_type = "SSLC Public Examination" if "10" in cls_std else "HSC Public Examination"
        
        docs.append({
            "school_id": school_id,
            "student_name": name_en.strip(),
            "student_name_ta": name_ta.strip(),
            "academic_year": year.strip(),
            "class_standard": std_fmt,
            "rank": "School First Rank",
            "achievement_type": ach_type,
            "marks_percentage": perc,
            "total_marks": marks.split('/')[0],
            "max_marks": marks.split('/')[1],
            "subject_stream": "General",
            "achievement_title": f"School Rank Holder ({year.strip()})",
            "photograph": None,
            "description": f"Secured {marks.strip()} marks in {ach_type} ({year.strip()}).",
            "status": "Active",
            "created_at": now,
            "updated_at": now
        })
        
    if docs:
        await db.rank_holders.insert_many(docs)
        logger.info("Inserted %d rank holders", len(docs))
        
if __name__ == "__main__":
    asyncio.run(run())
