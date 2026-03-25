/**
 * Invitation Email Template
 * Sent when inviting someone to join an event
 */

export interface InvitationEmailData {
  eventCode: string;
  eventTitle: string;
  senderName: string;
}

export function invitationEmailSubject(data: InvitationEmailData): string {
  return `${data.senderName} is requesting your availability for ${data.eventTitle}`;
}

export function invitationEmailHtml(data: InvitationEmailData): string {
  const { eventCode, eventTitle, senderName } = data;
  const eventUrl = `https://ymeets.com/dashboard/${eventCode}`;

  return `
<!--
* This email was built using Tabular.
* For more information, visit https://tabular.email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<title></title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<!--[if !mso]>-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="x-apple-disable-message-reformatting" content="" />
<meta content="target-densitydpi=device-dpi" name="viewport" />
<meta content="true" name="HandheldFriendly" />
<meta content="width=device-width" name="viewport" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
<style type="text/css">
table {
border-collapse: separate;
table-layout: fixed;
mso-table-lspace: 0pt;
mso-table-rspace: 0pt
}
table td {
border-collapse: collapse
}
.ExternalClass {
width: 100%
}
.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
line-height: 100%
}
body, a, li, p, h1, h2, h3 {
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
}
html {
-webkit-text-size-adjust: none !important
}
body {
min-width: 100%;
Margin: 0px;
padding: 0px;
}
body, #innerTable {
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale
}
#innerTable img+div {
display: none;
display: none !important
}
img {
Margin: 0;
padding: 0;
-ms-interpolation-mode: bicubic
}
h1, h2, h3, p, a {
overflow-wrap: normal;
white-space: normal;
word-break: break-word
}
a {
text-decoration: none
}
h1, h2, h3, p {
min-width: 100%!important;
width: 100%!important;
max-width: 100%!important;
display: inline-block!important;
border: 0;
padding: 0;
margin: 0
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important
}
u + #body a {
color: inherit;
text-decoration: none;
font-size: inherit;
font-family: inherit;
font-weight: inherit;
line-height: inherit;
}
a[href^="mailto"],
a[href^="tel"],
a[href^="sms"] {
color: inherit;
text-decoration: none
}
</style>
<style type="text/css">
@media (min-width: 481px) {
.hd { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.hm { display: none!important }
}
</style>
<style type="text/css">
@media (max-width: 480px) {
.t67{padding:0 0 22px!important}.t52,.t63,.t79,.t8{text-align:left!important}.t51,.t62,.t7,.t78{vertical-align:top!important;width:600px!important}.t5{border-top-left-radius:0!important;border-top-right-radius:0!important;padding:20px 30px!important}.t49{border-bottom-right-radius:0!important;border-bottom-left-radius:0!important;padding:30px!important}.t87{mso-line-height-alt:20px!important;line-height:20px!important}
}
</style>
<!--[if !mso]>-->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet" type="text/css" />
<!--<![endif]-->
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body id="body" class="t90" style="min-width:100%;Margin:0px;padding:0px;background-color:#E0E0E0;"><div class="t89" style="background-color:#E0E0E0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t88" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#E0E0E0;" valign="top" align="center">
<!--[if mso]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
<v:fill color="#E0E0E0"/>
</v:background>
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td align="center">
<table class="t70" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="566" class="t69" style="width:566px;">
<table class="t68" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t67" style="padding:50px 10px 31px 10px;"><div class="t66" style="width:100%;text-align:left;"><div class="t65" style="display:inline-block;"><table class="t64" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t63"><td></td><td class="t62" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t61" style="width:100%;"><tr><td class="t60" style="background-color:transparent;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t15" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t14" style="width:600px;">
<table class="t13" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t12"><div class="t11" style="width:100%;text-align:left;"><div class="t10" style="display:inline-block;"><table class="t9" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t8"><td></td><td class="t7" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t6" style="width:100%;"><tr><td class="t5" style="overflow:hidden;background-color:#5191F1;padding:19px 50px 17px 50px;border-radius:18px 18px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t4" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t3" style="width:600px;">
<table class="t2" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t1"><p class="t0" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:1px;">ymeets</p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t59" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="546" class="t58" style="width:600px;">
<table class="t57" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t56"><div class="t55" style="width:100%;text-align:left;"><div class="t54" style="display:inline-block;"><table class="t53" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t52"><td></td><td class="t51" width="546" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t50" style="width:100%;"><tr><td class="t49" style="overflow:hidden;background-color:#F8F8F8;padding:40px 50px 40px 50px;border-radius:0 0 18px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t21" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t20" style="width:490px;">
<table class="t19" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t18"><p class="t17" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">${senderName} needs your availability to schedule:<span class="t16" style="margin:0;Margin:0;mso-line-height-rule:exactly;"></span>&nbsp;</p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t22" style="mso-line-height-rule:exactly;mso-line-height-alt:16px;line-height:16px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t27" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="446" class="t26" style="width:490px;">
<table class="t25" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t24"><h1 class="t23" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:36px;font-weight:800;font-style:normal;font-size:32px;text-decoration:none;text-transform:none;letter-spacing:-1.56px;direction:ltr;color:#191919;text-align:left;mso-line-height-rule:exactly;mso-text-raise:-1px;">${eventTitle}</h1></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t28" style="mso-line-height-rule:exactly;mso-line-height-alt:25px;line-height:25px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t33" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t32" style="width:456px;">
<table class="t31" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t30"><p class="t29" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Add your availability to help find a time that works for everyone. <br/></p></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t34" style="mso-line-height-rule:exactly;mso-line-height-alt:22px;line-height:22px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="center">
<table class="t39" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="295" class="t38" style="width:295px;">
<table class="t37" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t36" style="overflow:hidden;background-color:#5191F1;text-align:center;line-height:44px;mso-line-height-rule:exactly;mso-text-raise:10px;padding:10px 30px 10px 30px;border-radius:40px 40px 40px 40px;"><a class="t35" href="${eventUrl}" style="display:block;margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:44px;font-weight:800;font-style:normal;font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:2.4px;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">share your Availability</a></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t40" style="mso-line-height-rule:exactly;mso-line-height-alt:42px;line-height:42px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr><tr><td align="left">
<table class="t48" role="presentation" cellpadding="0" cellspacing="0" style="Margin-right:auto;"><tr><td width="446" class="t47" style="width:563px;">
<table class="t46" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t45"><p class="t44" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;letter-spacing:-0.56px;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;"><span class="t41" style="margin:0;Margin:0;color:#888888;mso-line-height-rule:exactly;">Having trouble? Use this link instead: </span><span class="t43" style="margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;direction:ltr;color:#0000FF;mso-line-height-rule:exactly;"><span class="t42" style="margin:0;Margin:0;color:#5191F1;mso-line-height-rule:exactly;">${eventUrl}</span></span></p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td align="center">
<table class="t86" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="600" class="t85" style="width:600px;">
<table class="t84" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t83"><div class="t82" style="width:100%;text-align:left;"><div class="t81" style="display:inline-block;"><table class="t80" role="presentation" cellpadding="0" cellspacing="0" align="left" valign="top">
<tr class="t79"><td></td><td class="t78" width="600" valign="top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t77" style="width:100%;"><tr><td class="t76" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100% !important;"><tr><td align="center">
<table class="t75" role="presentation" cellpadding="0" cellspacing="0" style="Margin-left:auto;Margin-right:auto;"><tr><td width="500" class="t74" style="width:600px;">
<table class="t73" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;"><tr><td class="t72"><p class="t71" style="margin:0;Margin:0;font-family:Albert Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:22px;font-weight:500;font-style:normal;font-size:12px;text-decoration:none;text-transform:none;direction:ltr;color:#888888;text-align:center;mso-line-height-rule:exactly;mso-text-raise:3px;">© 2026 – ymeets – a y/cs product<br/></p></td></tr></table>
</td></tr></table>
</td></tr></table></td></tr></table>
</td>
<td></td></tr>
</table></div></div></td></tr></table>
</td></tr></table>
</td></tr><tr><td><div class="t87" style="mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block;">&nbsp;&nbsp;</div></td></tr></table></td></tr></table></div><div class="gmail-fix" style="display: none; white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></body>
</html>
`.trim();
}
