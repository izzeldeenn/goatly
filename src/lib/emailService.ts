import crypto from 'crypto';

// Simple email service using fetch API for Brevo
const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.NEXT_PUBLIC_BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: {
    name: string;
    email: string;
  };
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if API key is configured
    if (!BREVO_API_KEY) {
      console.error('Brevo API key is not configured. Please set BREVO_API_KEY environment variable.');
      return { 
        success: false, 
        error: 'Brevo API key is not configured. Please contact administrator.' 
      };
    }

    const defaultSender = {
      name: 'Goatly App',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@goatly.app'
    };

    const message = {
      sender: options.sender || defaultSender,
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent || options.htmlContent.replace(/<[^>]*>/g, '')
    };

    console.log('Sending email to:', options.to);
    console.log('Using API key:', BREVO_API_KEY ? 'Configured' : 'Not configured');
    console.log('API URL:', BREVO_API_URL);
    console.log('Message payload:', JSON.stringify(message, null, 2));

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Brevo API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return { 
      success: true, 
      messageId: result.messageId 
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email'
    };
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <html dir="rtl" style="font-family: Arial, sans-serif; direction: rtl;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">� Goatly</h1>
            <h2 style="color: #333; margin: 10px 0;">إعادة تعيين كلمة المرور</h2>
          </div>
          
          <div style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            <p>مرحباً ${userName || 'صديق Goatly'}،</p>
            <p>لقد تلقيت هذا البريد لأنك طلبت إعادة تعيين كلمة المرور لحسابك في Goatly.</p>
            <p>اضغط على الزر التالي لإعادة تعيين كلمة المرور:</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <div style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p><strong>ملاحظات هامة:</strong></p>
            <ul style="margin: 10px 0; padding-right: 20px;">
              <li>هذا الرابط صالح لمدة 15 دقيقة فقط</li>
              <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد</li>
              <li>لأسباب أمنية، لا تشارك هذا الرابط مع أي شخص</li>
            </ul>
            
            <p style="margin-top: 20px;">
              إذا واجهت أي مشكلة، يمكنك نسخ الرابط التالي ولصقه في متصفحك:<br>
              <span style="word-break: break-all; color: #4CAF50;">${resetUrl}</span>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>© 2026 Goatly - تطبيق تعلم اللغات المسلّي</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
    مرحباً ${userName || 'صديق Goatly'}،
    
    لقد تلقيت هذا البريد لأنك طلبت إعادة تعيين كلمة المرور لحسابك في Goatly.
    
    اضغط على الرابط التالي لإعادة تعيين كلمة المرور:
    ${resetUrl}
    
    ملاحظات هامة:
    - هذا الرابط صالح لمدة 15 دقيقة فقط
    - إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد
    - لأسباب أمنية، لا تشارك هذا الرابط مع أي شخص
    
    © 2026 Goatly - تطبيق تعلم اللغات المسلّي
  `;

  return sendEmail({
    to: email,
    subject: 'إعادة تعيين كلمة المرور - Goatly',
    htmlContent,
    textContent
  });
}

// Generate secure reset token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate expiry time (15 minutes from now)
export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);
  return expiry;
}

// Verify if token is expired
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}
