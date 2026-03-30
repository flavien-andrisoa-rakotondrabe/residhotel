<!DOCTYPE html>
<html>
<head>
</head>
<body>
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">

              <div class="m_-3896449382933902698mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 25px 20px 25px;word-break:break-word">
                        <div style="font-family:Arial,sans-serif;font-size:22px;line-height:1;text-align:left;color:#000000">
                          <h1 style="margin:0;font-size:22px;font-weight:bold">{{ __('auth.email.title', ['firstName' => $user->firstName, 'lastName' => $user->lastName]) }}</h1>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 25px 25px 25px;word-break:break-word">
                        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1;text-align:left;color:#55575d">{{ __('auth.email.description', ['appName' => $appName]) }}</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 25px 30px 25px;word-break:break-word">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%">
                          <tbody>
                            <tr>
                              <td align="center" bgcolor="#000000" role="presentation" style="border:none;border-radius:8px;background:#000000" valign="middle">
                                <a href="{{ $url }}" target="_blank">{{ __('auth.email.button') }}</a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word">
                        <div style="font-family:Arial,sans-serif;font-size:12px;line-height:1;text-align:left;color:#999999">{{ __('auth.email.if_error') }}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </td>
          </tr>
        </tbody>
      </table>
</body>
</html>
