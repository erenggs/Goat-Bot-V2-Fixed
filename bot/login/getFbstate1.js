const cheerio = require("cheerio");
const qs = require("qs");
const requestLib = require("request");

const TARGET_COOKIE = "https://m.facebook.com/";
const URL_LOGIN_CHECKPOINT = "https://m.facebook.com/login/checkpoint/?next=https://m.facebook.com/home.php?refsrc=deprecated";

const DEFAULT_HEADERS = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-language": "vi,en-US;q=0.9,en;q=0.8",
  "sec-ch-ua": '" Not;A Brand";v="99", "Microsoft Edge";v="103", "Chromium";v="103"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Linux; Android 12; M2102J20SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36",
};

async function checkAndSaveCookies(jar, headers, request) {
  const resHome = await request({
    url: TARGET_COOKIE,
    method: "GET",
    jar,
    headers,
  });

  const referer = resHome.request.headers.referer || "";
  if (referer.match(/checkpoint\/\d+/)) {
    const codeCheckpoint = referer.match(/checkpoint\/(\d+)/)[1];
    const error = new Error(
      `Your account has been checkpointed ${codeCheckpoint} by Facebook. Please login and complete the checkpoint.`
    );
    error.name = `CHECKPOINT_${codeCheckpoint}`;
    throw error;
  } else {
    return jar.getCookies(TARGET_COOKIE);
  }
}

module.exports = async function (email, pass, userAgent, proxy) {
  const headers = { ...DEFAULT_HEADERS, "user-agent": userAgent || DEFAULT_HEADERS["user-agent"] };
  const _request = proxy
    ? requestLib.defaults({ jar: true, headers, simple: false, proxy })
    : requestLib.defaults({ jar: true, headers, simple: false });

  const request = (options) =>
    new Promise((resolve, reject) => {
      _request(options, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

  const jar = _request.jar();
  jar.setCookie("locale=en_US", TARGET_COOKIE);

  // Step 1: Get login page
  const res1 = await request({ url: "https://m.facebook.com/login/", method: "GET", jar });
  let $ = cheerio.load(res1.body);
  const formData1 = { ...qs.parse($("#login_form").serialize()) };
  delete formData1.pass;
  formData1.email = email;
  formData1.encpass = `#PWD_BROWSER:0:${Math.floor(Date.now() / 1000)}:${pass}`;
  formData1.prefill_contact_point = email;
  formData1.prefill_source = "browser_dropdown";
  formData1.prefill_type = "password";
  formData1.first_prefill_source = "browser_dropdown";
  formData1.first_prefill_type = "contact_point";
  formData1.had_cp_prefilled = "true";
  formData1.had_password_prefilled = "true";
  formData1.is_smart_lock = "false";
  formData1.bi_xrwh = "0";
  formData1.try_number = "0";
  formData1.unrecognized_tries = "0";

  // Step 2: Post login
  const res2 = await request({
    url: "https://m.facebook.com/login/device-based/login/async/?refsrc=deprecated&lwv=100",
    method: "POST",
    jar,
    form: formData1,
  });

  if (res2.body.includes("You used an old password")) throw Object.assign(new Error("Old password"), { name: "OLD_PASSWORD" });
  if (
    res2.body.includes(`href=\\"\\/recover\\/initiate\\/?email=${email}&amp;ars=facebook_login_pw_error`) ||
    res2.body.includes('"m_login_notice":"Invalid username or password"') ||
    res2.body.includes("Incorrect password.") ||
    res2.body.includes("forgot_password_uri") ||
    res2.headers.location?.includes("m_lara_first_password_failure")
  )
    throw Object.assign(new Error("Wrong username or password"), { name: "WRONG_ACCOUNT" });

  if (jar.getCookieString(TARGET_COOKIE).includes("c_user"))
    return await checkAndSaveCookies(jar, headers, request);

  // Step 3: Handle checkpoint / 2FA
  const res3 = await request({ url: URL_LOGIN_CHECKPOINT, method: "GET", jar });
  if (jar.getCookieString(TARGET_COOKIE).includes("c_user"))
    return await checkAndSaveCookies(jar, headers, request);

  $ = cheerio.load(res3.body);
  if (!res2.body && res3.body.includes('<form method="post" action="/login/device-based') && $('button[name="login"]').length)
    throw Object.assign(new Error("Cannot login to Facebook, please check your account"), { name: "CANNOT_LOGIN" });

  // 2FA handling
  if ($("#checkpoint_title")?.text()?.includes("Enter login code to continue")) {
    throw {
      name: "2FA_CODE_REQUIRED",
      message: "2FA code required, call function 'continue' to submit code",
      continue: async function submit2FA(code) {
        const formData2 = { ...qs.parse($('form[method="post"][class="checkpoint"]').serialize()) };
        formData2.approvals_code = code;
        const res4 = await request({ url: URL_LOGIN_CHECKPOINT, method: "POST", form: formData2, jar });

        if (jar.getCookieString(TARGET_COOKIE).includes("c_user"))
          return await checkAndSaveCookies(jar, headers, request);

        $ = cheerio.load(res4.body);
        if ($('button[name="submit[Submit Code]"]').text() === formData2['submit[Submit Code]'])
          throw { name: "2FA_CODE_INVALID", message: "Invalid 2FA code", continue: submit2FA };

        // Continue checkpoint workflow
        let formData = { ...qs.parse($('form[method="post"][class="checkpoint"]').serialize()) };
        delete formData.approvals_code;
        formData.name_action_selected = "save_device";
        formData['submit[Continue]'] = $('#checkpointSubmitButton').text();

        const res5 = await request({ url: URL_LOGIN_CHECKPOINT, method: "POST", form: formData, jar });
        if (jar.getCookieString(TARGET_COOKIE).includes("c_user"))
          return await checkAndSaveCookies(jar, headers, request);

        throw Object.assign(new Error("Login failed after 2FA"), { name: "LOGIN_FAILED" });
      },
    };
  }

  throw Object.assign(new Error("Cannot login to Facebook, please check your account"), { name: "LOGIN_FAILED", response: res3 });
};
