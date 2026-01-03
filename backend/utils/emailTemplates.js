export const getEmailTemplate = (otp, type) => {
  const isLogin = type === 'Login Verification Code';
  const title = isLogin ? 'Login Verification' : 'Verify Your Account';
  const message = isLogin
    ? 'Use the code below to securely log into your FoodieAI account.'
    : 'Welcome to FoodieAI! Use the code below to verify your email address.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f5f0; margin: 0; padding: 0;  }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e7e5e4; }
        .header { background-color: #dc2626; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; text-align: center; }
        .title { color: #292524; font-size: 24px; font-weight: 700; margin-bottom: 15px; }
        .text { color: #57534e; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .otp-box { background-color: #fff1f2; border: 2px dashed #dc2626; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 30px; }
        .otp-code { color: #dc2626; font-size: 32px; font-weight: 800; letter-spacing: 5px; font-family: monospace; margin: 0; }
        .footer { background-color: #f8f5f0; padding: 20px; text-align: center; color: #78716c; font-size: 12px; border-top: 1px solid #e7e5e4; }
        .highlight { color: #dc2626; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FoodieAI</h1>
        </div>
        <div class="content">
          <h2 class="title">${title}</h2>
          <p class="text">${message}</p>
          
          <div class="otp-box">
            <h3 class="otp-code">${otp}</h3>
          </div>

          <p class="text" style="font-size: 14px; margin-bottom: 0;">
            This code will expire in <span class="highlight">5 minutes</span>.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} FoodieAI Inc. All rights reserved.<br>
          Delivering happiness, one bite at a time.
        </div>
      </div>
    </body>
    </html>
  `;
};
