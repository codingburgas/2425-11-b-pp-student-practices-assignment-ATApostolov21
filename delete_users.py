from dotenv import load_dotenv
load_dotenv()
import os
print('DATABASE_URL as seen by Python:', os.environ.get('DATABASE_URL'))
# ... existing code ... 