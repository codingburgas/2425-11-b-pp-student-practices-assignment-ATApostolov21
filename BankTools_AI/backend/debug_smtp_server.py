import asyncore
import smtpd
import email
import time
import os
from email.parser import Parser

class DebuggingServer(smtpd.SMTPServer):
    def __init__(self, localaddr, remoteaddr):
        print(f"Starting mail server on {localaddr[0]}:{localaddr[1]}")
        super().__init__(localaddr, remoteaddr)
        
        # Create a directory to save emails
        if not os.path.exists('debug_emails'):
            os.makedirs('debug_emails')
    
    def process_message(self, peer, mailfrom, rcpttos, data, **kwargs):
        print(f"Receiving message from: {mailfrom}")
        print(f"Message for: {rcpttos}")
        
        # Parse the email
        msg = Parser().parsestr(data.decode('utf-8'))
        
        # Save the email to a file
        timestamp = int(time.time())
        filename = f"debug_emails/email_{timestamp}.txt"
        
        with open(filename, 'w') as f:
            f.write(f"From: {mailfrom}\n")
            f.write(f"To: {', '.join(rcpttos)}\n")
            f.write(f"Subject: {msg.get('Subject', 'No Subject')}\n")
            f.write(f"Date: {msg.get('Date', 'No Date')}\n\n")
            
            # Write the body
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        f.write(part.get_payload())
                    elif part.get_content_type() == "text/html":
                        f.write(f"\n\nHTML Content:\n{part.get_payload()}\n")
            else:
                f.write(msg.get_payload())
        
        print(f"Email saved to {filename}")
        return

if __name__ == "__main__":
    server = DebuggingServer(('127.0.0.1', 1025), None)
    print("Mail server running. Press Ctrl+C to stop.")
    try:
        asyncore.loop()
    except KeyboardInterrupt:
        print("Mail server stopped") 