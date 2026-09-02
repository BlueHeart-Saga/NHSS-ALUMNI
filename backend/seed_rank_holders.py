# import asyncio
# import logging
# from datetime import datetime, timezone
# from motor.motor_asyncio import AsyncIOMotorClient
# from app.core.config import settings

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("seed_rank_holders")

# RAW_DATA = """
# M.Murugan|1963|429/500|மு.முருகன்
# A.K.Ravindran|1964|397/500|அ.கா.ரவீந்திரன்
# R.Sarguna Pandi|1965|394/500|ரா.சற்குண பாண்டி
# A.Pachaiya|1966|511/500|அ.பச்சையா
# P.Sokkalingam|1967|401/500|பெ.சொக்கலிங்கம்
# R.Elangovan|1968|427/500|ரா.இளங்கோவன்
# M.Kadakarai Thangam|1969|457/500|மு.கடற்கரை தங்கம்
# S.Arumuga Samy|1970|436/500|சு.ஆறுமுக சாமி
# M.Velayutham|1971|438/500|மு.வேலாயுதம்
# P.Bala Kirutinan|1972|481/500|பெ.பால கிருட்டிணன்
# S.Vel Vasagam|1973|478/500|சு.வேல் வாசகம்
# V.Veera Kesavan|1974|441/500|வி.வீர கேசவன்
# S.Magimai Raja|1975|476/500|சு.மகிமை ராஜா
# T.Selvan|1976|470/500|த.செல்வன்
# M.Anna Malai|1977|443/500|மு.அண்ணாமலை
# K.Bala Murugan|1978|388/500|க.பால முருகன்
# M.Kamalakannan|1978|345/500|மு.கமலக்கண்ணன்
# E.L.ArulSingh|1979|386/500|ஈ.எல்.அருள்சிங்
# P.Muruga Boopathi|1980|360/500|பெ.முருக பூபதி
# S.Victor Resinald|1981|408/500|சு.விக்டர் ரெசினால்டு
# P.Sathya Rasan|1982|371/500|பெ.சத்திய ராசன்
# K.S.S.Chandira Rajan|1983|433/500|க.ச.ச.சந்திர ராஜன்
# K.Murukesan|1984|452/500|க.முருகேசன்
# K.Raga Seelan|1985|398/500|க.ராக சீலன்
# T.Bala Saraswathi|1986|411/500|த.பால சரஸ்வதி
# S.Senthil Kumar|1987|426/500|செ.செந்தில் குமார்
# R.Thangamani|1988|410/500|ரா.தங்கமணி
# S.Paruna Baskaran|1989|430/500|செ.பருண பாஸ்கரன்
# M.Ganapathi Sundaram|1990|419/500|மு.கணபதி சுந்தரம்
# A.Mariyappan|1991|377/500|அ.மாரியப்பன்
# K.Jawahar Kumar|1992|452/500|க.ஜவஹர் குமார்
# L.Lingaiya|1993|943/1200|ல.லிங்கையா
# L.SivaKaman|1993|454/500|ல.சிவகாமன்
# E.Jeya Chandran|1994|1062/1200|ஈ.ஜெய சந்திரன்
# S.Sharmila|1994|429/500|ச.ஷர்மிளா
# C.Kaali|1995|1042/1200|சி.காளி
# M.Karpagavali|1995|454/500|மு.கற்பகவல்லி
# R.Selvam|1996|1004/1200|ரா.செல்வம்
# N.Muthu Lakshmi|1996|444/500|ந.முத்து லட்சுமி
# M.Karpagavali|1997|1059/1200|மு.கற்பகவல்லி
# S.Sankar Raman|1997|441/500|ச.சங்கர் ராமன்
# N.Muthu Lakshmi|1998|1120/1200|ந.முத்து லட்சுமி
# C.Gnanasekaran|1998|454/500|சி.ஞானசேகரன்
# S.Murukesan|1999|450/500|ச.முருகேசன்
# S.Harihara Sutha|1999|1024/1200|ச.ஹரிஹர சுதா
# P.Prabhu|2000|452/500|ப.பிரபு
# S.ParavathaRaj|2000|1065/1200|ச.பர்வதராஜ்
# M.Siva Sankar|2001|465/500|மு.சிவ சங்கர்
# S.Kalai Madasamy|2001|1089/1200|ச.கலை மாடசாமி
# S.Mercilin Geetha|2002|440/500|செ.மெர்சிலின் கீதா
# M.Prema|2002|1075/1200|மு.பிரேமா
# O.Jyothi|2003|1140/1200|ஓ.ஜோதி
# R.Rajkumar|2003|457/500|ரா.ராஜ்குமார்
# P.Muthuvijayan|2004|1032/1200|ப.முத்துவிஜயன்
# R.Raja|2004|453/500|ரா.ராஜா
# R.Rajkumar|2005|1111/1200|ரா.ராஜ்குமார்
# U.uthanduraman|2005|458/500|உ.உத்தண்டுராமன்
# R.Raja|2006|993/1200|ரா.ராஜா
# R.Selvarani|2006|456/500|ரா.செல்வராணி
# S.Sangeetha|2007|1070/1200|ச.சங்கீதா
# P.Ramalingam|2007|423/500|ப.ராமலிங்கம்
# P.Saravanakumar|2008|1020/1200|ப.சரவணக்குமார்
# G.Kandharajan|2008|477/500|கோ.கந்தராஜன்
# K.Maniraj|2009|961/1200|க.மணிராஜ்
# e.Venkatraman|2009|456/500|ஈ.வெங்கட்ராமன்
# G.Kandharajan|2010|1070/1200|கோ.கந்தராஜன்
# S.Kamaraj|2010|451/500|ச.காமராஜ்
# V.Madhankumar|2011|1098/1200|வி.மதன்குமார்
# P.Indra|2011|472/500|ப.இந்திரா
# A.Kavitha|2012|1013/1200|அ.கவிதா
# C.Rajmohan|2012|473/500|சி.ராஜ்மோகன்
# P.Dhana Lakshhmi|2013|1027/1200|ப.தன லட்சுமி
# C.Surya|2013|484/500|சி.சூர்யா
# """

# async def seed_rank_holders():
#     logger.info("Connecting to MongoDB...")
#     client = AsyncIOMotorClient(settings.MONGODB_URI)
#     db = client[settings.MONGODB_DATABASE]

#     # Get target school ID
#     school = await db.schools.find_one({})
#     school_id = str(school["_id"]) if school and "_id" in school else "6a911868ce252b2a8047455d"

#     # Clear existing rank_holders collection before inserting clean historical records
#     await db.rank_holders.delete_many({})
#     logger.info("Cleared existing rank_holders collection.")

#     now = datetime.now(timezone.utc)
#     docs = []

#     lines = [line.strip() for line in RAW_DATA.strip().split("\n") if line.strip()]
#     for line in lines:
#         parts = line.split("|")
#         if len(parts) < 3:
#             continue
        
#         name = parts[0].strip()
#         year = parts[1].strip()
#         marks_raw = parts[2].strip()
#         name_ta = parts[3].strip() if len(parts) > 3 else None
        
#         # Parse marks
#         total_marks = ""
#         max_marks = "500"
#         pct_str = ""
        
#         if "/" in marks_raw:
#             m_parts = marks_raw.split("/")
#             total_marks = m_parts[0].strip()
#             max_marks = m_parts[1].strip()
#             try:
#                 tot_val = float(total_marks)
#                 max_val = float(max_marks)
#                 if max_val > 0:
#                     pct_str = f"{round((tot_val / max_val) * 100, 2)}%"
#             except Exception:
#                 pass
#         else:
#             total_marks = marks_raw

#         # Class standard & achievement type
#         class_std = "12th HSC" if max_marks == "1200" else "10th SSLC"
#         achieve_type = "HSC Public Examination" if max_marks == "1200" else "SSLC Public Examination"

#         doc = {
#             "school_id": school_id,
#             "student_name": name,
#             "student_name_ta": name_ta,
#             "academic_year": year,
#             "class_standard": class_std,
#             "rank": "School First Rank",
#             "achievement_type": achieve_type,
#             "marks_percentage": pct_str,
#             "total_marks": total_marks,
#             "max_marks": max_marks,
#             "subject_stream": "General",
#             "achievement_title": f"School Rank Holder ({year})",
#             "photograph": None,
#             "description": f"Secured {marks_raw} marks in {achieve_type} ({year}).",
#             "status": "Active",
#             "created_at": now,
#             "updated_at": now
#         }
#         docs.append(doc)

#     if docs:
#         res = await db.rank_holders.insert_many(docs)
#         logger.info(f"Successfully inserted {len(res.inserted_ids)} historical rank holder records with Tamil translations into 'rank_holders' collection!")
#     else:
#         logger.warning("No records parsed.")

# if __name__ == "__main__":
#     asyncio.run(seed_rank_holders())
