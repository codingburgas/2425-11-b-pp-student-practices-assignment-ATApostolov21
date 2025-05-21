from threading import Thread
from flask import current_app, render_template
from flask_mail import Message
from . import mail


def send_async_email(app, msg):
    """
    Helper function to send an email asynchronously.
    """
    with app.app_context():
        try:
            mail.send(msg)
            print(f"Email sent successfully to {msg.recipients}")
        except Exception as e:
            print(f"Failed to send email: {str(e)}")


def send_email(to, subject, template, **kwargs):
    """
    Send an email using the given template and context.
    
    Args:
        to (str): Recipient email address
        subject (str): Email subject
        template (str): Path to the template, without extension
        **kwargs: Arguments to pass to the template
    """
    app = current_app._get_current_object()
    
    print(f"Email configuration:")
    print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
    print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
    print(f"MAIL_USE_TLS: {app.config['MAIL_USE_TLS']}")
    print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
    print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
    
    msg = Message(
        subject=app.config['MAIL_DEFAULT_SENDER'] + ' ' + subject,
        recipients=[to],
        sender=app.config['MAIL_DEFAULT_SENDER']
    )
    
    # Try to render both text and HTML templates
    try:
        msg.body = render_template(template + '.txt', **kwargs)
        print(f"Text template rendered successfully")
    except Exception as e:
        print(f"Failed to render text template: {str(e)}")
        msg.body = f"Please use an HTML-capable email client to view this message. {subject}"
    
    try:
        msg.html = render_template(template + '.html', **kwargs)
        print(f"HTML template rendered successfully")
    except Exception as e:
        print(f"Failed to render HTML template: {str(e)}")
        # If HTML template is missing, use plain text
        if msg.body:
            msg.html = f"<pre>{msg.body}</pre>"
    
    # Send email asynchronously
    thread = Thread(target=send_async_email, args=[app, msg])
    thread.start()
    
    return thread 