"use strict";

const utils = require("./utils");
const cheerio = require("cheerio");
const log = require("npmlog");
const fs = require("fs");
const path = require("path");

log.maxRecordSize = 100;

const Boolean_Option = [
  "online",
  "selfListen",
  "listenEvents",
  "updatePresence",
  "forceLogin",
  "autoMarkDelivery",
  "autoMarkRead",
  "listenTyping",
  "autoReconnect",
  "emitReady",
];

global.ditconmemay = false;

function setOptions(globalOptions, options) {
  Object.keys(options).forEach((key) => {
    if (Boolean_Option.includes(key)) {
      globalOptions[key] = Boolean(options[key]);
    } else {
      switch (key) {
        case "pauseLog":
          options.pauseLog ? log.pause() : log.resume();
          break;
        case "logLevel":
          log.level = options.logLevel;
          globalOptions.logLevel = options.logLevel;
          break;
        case "logRecordSize":
          log.maxRecordSize = options.logRecordSize;
          globalOptions.logRecordSize = options.logRecordSize;
          break;
        case "pageID":
          globalOptions.pageID = options.pageID.toString();
          break;
        case "userAgent":
          globalOptions.userAgent =
            options.userAgent ||
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
          break;
        case "proxy":
          if (typeof options.proxy !== "string") {
            delete globalOptions.proxy;
            utils.setProxy();
          } else {
            globalOptions.proxy = options.proxy;
            utils.setProxy(globalOptions.proxy);
          }
          break;
        default:
          log.warn("setOptions", `Unrecognized option given to setOptions: ${key}`);
      }
    }
  });
}

function buildAPI(globalOptions, html, jar) {
  let fb_dtsg = null;
  let irisSeqID = null;

  try {
    const $ = cheerio.load(html);

    $("script").each((i, script) => {
      if (fb_dtsg) return;
      const scriptText = $(script).html() || "";
      const patterns = [
        /,{"token":"([^"]+)"}]/,
        /,{"token":"([^"]+)"/,
        /"token":"([^"]+)"/,
        /{\"token\":\"([^\]+)\"/,
        /,{"token":"([^"]+)"},\d+]/,
        /"async_get_token":"([^"]+)"/,
        /"dtsg":{"token":"([^"]+)"/,
        /DTSGInitialData[^>]+>([^<]+)/,
      ];
      for (const pattern of patterns) {
        const match = scriptText.match(pattern);
        if (match && match[1]) {
          try {
            const possibleJson = match[1].replace(/\\"/g, '"');
            const parsed = JSON.parse(possibleJson);
            fb_dtsg = parsed.token || parsed;
          } catch {
            fb_dtsg = match[1];
          }
          if (fb_dtsg) break;
        }
      }
    });

    if (!fb_dtsg) {
      const dtsgInput = $('input[name="fb_dtsg"]').val();
      if (dtsgInput) fb_dtsg = dtsgInput;
    }

    const seqMatches = html.match(/irisSeqID":"([^"]+)"/);
    if (seqMatches && seqMatches[1]) {
      irisSeqID = seqMatches[1];
    }

    try {
      const jsonMatches = html.match(/{"dtsg":({[^}]+})/);
      if (jsonMatches && jsonMatches[1]) {
        const dtsgData = JSON.parse(jsonMatches[1]);
        if (dtsgData.token) fb_dtsg = dtsgData.token;
      }
    } catch {}

    if (fb_dtsg) {
      log.info("login", "Đã tìm thấy fb_dtsg");
    }
  } catch (e) {
    log.error("login", "Lỗi khi tìm fb_dtsg:", e);
  }

  const cookies = jar.getCookies("https://www.facebook.com");
  const userCookie = cookies.find((c) => c.cookieString().startsWith("c_user="));
  const tiktikCookie = cookies.find((c) => c.cookieString().startsWith("i_user="));

  if (!userCookie && !tiktikCookie) {
    log.error("login", "Không tìm thấy cookie cho người dùng, vui lòng kiểm tra lại thông tin đăng nhập");
    return;
  }

  if (html.includes("/checkpoint/block/?next")) {
    log.error("login", "Appstate die, vui lòng thay cái mới!", "error");
    return;
  }

  const userID = (tiktikCookie || userCookie).cookieString().split("=")[1];

  try {
    clearInterval(checkVerified);
  } catch {}

  const clientID = ((Math.random() * 2147483648) | 0).toString(16);
  let mqttEndpoint = `wss://edge-chat.facebook.com/chat?region=prn&sid=${userID}`;
  let region = "PRN";

  try {
    const endpointMatch = html.match(/"endpoint":"([^"]+)"/);
    if (endpointMatch) {
      if (endpointMatch.input.includes("601051028565049")) {
        log.warn("login", "Lỗi login vì dính tài khoản tự động");
        global.ditconmemay = true;
      }
      mqttEndpoint = endpointMatch[1].replace(/\\\//g, "/");
      const url = new URL(mqttEndpoint);
      region = url.searchParams.get("region")?.toUpperCase() || "PRN";
    }
  } catch (e) {
    log.warn("login", "Using default MQTT endpoint");
  }

  log.info("login", "Fix fca by DongDev x Satoru, published By Team Calyx");

  const ctx = {
    userID,
    jar,
    clientID,
    globalOptions,
    loggedIn: true,
    access_token: "NONE",
    clientMutationId: 0,
    mqttClient: undefined,
    lastSeqId: irisSeqID,
    syncToken: undefined,
    mqttEndpoint,
    region,
    firstListen: true,
    fb_dtsg,
    req_ID: 0,
    callback_Task: {},
    wsReqNumber: 0,
    wsTaskNumber: 0,
    reqCallbacks: {},
  };

  const defaultFuncs = utils.makeDefaults(html, userID, ctx);

  const api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState: () => utils.getAppState(jar),
    postFormData: (url, body) => defaultFuncs.postFormData(url, ctx.jar, body),
    getFreshDtsg: async () => {
      try {
        const res = await defaultFuncs.get("https://www.facebook.com/", jar, null, globalOptions);
        const $ = cheerio.load(res.body);
        let newDtsg;

        const patterns = [
          /"DTSGInitialData",\[.*,{"token":"([^"]+)"}]/,
          /"DTSGInitData",\[.*,{"token":"([^"]+)"/,
          /"token":"([^"]+)"/,
          /name="fb_dtsg" value="([^"]+)"/,
        ];

        $("script").each((i, script) => {
          if (!newDtsg) {
            const scriptText = $(script).html() || "";
            for (const pattern of patterns) {
              const match = scriptText.match(pattern);
              if (match && match[1]) {
                newDtsg = match[1];
                break;
              }
            }
          }
        });

        if (!newDtsg) newDtsg = $('input[name="fb_dtsg"]').val();

        return newDtsg;
      } catch (e) {
        log.error("login", "Error getting fresh dtsg:", e);
        return null;
      }
    },
  };

  // Dynamically load all API modules from /src
  const srcDir = path.join(__dirname, "src");
  if (fs.existsSync(srcDir)) {
    fs.readdirSync(srcDir)
      .filter((file) => file.endsWith(".js"))
      .forEach((file) => {
        api[file.replace(".js", "")] = require(path.join(srcDir, file))(defaultFuncs, api, ctx);
      });
  }

  api.listen = api.listenMqtt;

  return { ctx, defaultFuncs, api };
}

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
  return async function (res) {
    try {
      const html = res.body;
      const $ = cheerio.load(html);

      let inputs = [];
      $("#login_form input").each((i, el) => {
        inputs.push({ val: $(el).val(), name: $(el).attr("name") });
      });
      inputs = inputs.filter((input) => input.val && input.val.length);
      const form = utils.arrToForm(inputs);

      form.lsd = utils.getFrom(html, ',"LSD",[],{"token":"', '"}');
      form.lgndim = Buffer.from(JSON.stringify({ w: 1440, h: 900, aw: 1440, ah: 834, c: 24 })).toString("base64");
      form.email = email;
      form.pass = password;
      form.default_persistent = "0";
      form.lgnrnd = utils.getFrom(html, 'name="lgnrnd" value="', '"');
      form.locale = "en_US";
      form.timezone = "240";
      form.lgnjs = Math.floor(Date.now() / 1000);

      log.info("login", "Logging in...");

      const loginRes = await utils.post(
        "https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110",
        jar,
        form,
        loginOptions
      );

      await utils.saveCookies(jar)(loginRes);

      const headers = loginRes.headers;
      if (!headers.location) throw new Error("Wrong username/password.");

      if (headers.location.includes("https://www.facebook.com/checkpoint/")) {
        log.info("login", "You have login approvals turned on.");

        const checkpointRes = await utils.get(headers.location, jar, null, loginOptions);
        await utils.saveCookies(jar)(checkpointRes);

        const checkpointHtml = checkpointRes.body;
        const $$ = cheerio.load(checkpointHtml);

        let checkpointForm = [];
        $$("form input").each((i, el) => {
          checkpointForm.push({ val: $$(el).val(), name: $$(el).attr("name") });
        });

        checkpointForm = checkpointForm.filter((input) => input.val && input.val.length);
        const checkpointFormData = utils.arrToForm(checkpointForm);

        if (checkpointHtml.includes("checkpoint/?next")) {
          return new Promise((resolve, reject) => {
            const submit2FA = async (code) => {
              try {
                checkpointFormData.approvals_code = code;
                checkpointFormData["submit[Continue]"] = $$("#checkpointSubmitButton").html();

                const approvalRes = await utils.post(
                  "https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php",
                  jar,
                  checkpointFormData,
                  loginOptions
                );
                await utils.saveCookies(jar)(approvalRes);

                const approvalError = $$("#approvals_code").parent().attr("data-xui-error");
                if (approvalError) throw new Error("Invalid 2FA code.");

                checkpointFormData.name_action_selected = "dont_save";

                const finalRes = await utils.post(
                  "https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php",
                  jar,
                  checkpointFormData,
                  loginOptions
                );
                await utils.saveCookies(jar)(finalRes);

                const appState = utils.getAppState(jar);
                resolve(await loginHelper(appState, email, password, loginOptions, callback));
              } catch (error) {
                reject(error);
              }
            };

            throw { error: "login-approval", continue: submit2FA };
          });
        }

        if (!loginOptions.forceLogin) throw new Error("Couldn't login. Facebook might have blocked this account.");

        checkpointFormData["submit[This was me]"] = checkpointHtml.includes("Suspicious Login Attempt")
          ? "This was me"
          : "This Is Okay";

        await utils.post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, checkpointFormData, loginOptions);

        checkpointFormData.name_action_selected = "save_device";

        await utils.post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, checkpointFormData, loginOptions);

        const appState = utils.getAppState(jar);
        return await loginHelper(appState, email, password, loginOptions, callback);
      }

      await utils.get("https://www.facebook.com/", jar, null, loginOptions);

      return await utils.saveCookies(jar);
    } catch (error) {
      callback(error);
    }
  };
}

async function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
  const jar = utils.getJar();

  if (appState) {
    try {
      appState = typeof appState === "string" ? JSON.parse(appState) : appState;
    } catch {
      return callback(new Error("Failed to parse appState"));
    }

    try {
      appState.forEach((c) => {
        const cookieStr = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
        jar.setCookie(cookieStr, "http://" + c.domain);
      });

      await utils.get("https://www.facebook.com/", jar, null, globalOptions, { noRef: true });
      await utils.saveCookies(jar);
    } catch (e) {
      process.exit(1);
    }
  } else {
    await utils
      .get("https://www.facebook.com/", null, null, globalOptions, { noRef: true })
      .then(utils.saveCookies(jar))
      .then(makeLogin(jar, email, password, globalOptions, callback, prCallback))
      .then(() => utils.get("https://www.facebook.com/", jar, null, globalOptions).then(utils.saveCookies(jar)));
  }

  async function handleRedirect(res) {
    const reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
    const redirect = reg.exec(res.body);
    if (redirect && redirect[1]) {
      return utils.get(redirect[1], jar, null, globalOptions).then(utils.saveCookies(jar));
    }
    return res;
  }

  let ctx, api;

  await utils
    .get("https://www.facebook.com/", jar, null, globalOptions)
    .then(handleRedirect)
    .then(async (res) => {
      const mobileAgentRegex = /MPageLoadClientMetrics/gs;
      if (!mobileAgentRegex.test(res.body)) {
        globalOptions.userAgent =
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
        const resp = await utils.get("https://www.facebook.com/", jar, null, globalOptions, { noRef: true });
        await utils.saveCookies(jar)(resp);
        return resp;
      }
      return res;
    })
    .then(handleRedirect)
    .then((res) => {
      const html = res.body;
      const Obj = buildAPI(globalOptions, html, jar);
      ctx = Obj.ctx;
      api = Obj.api;
      return res;
    });

  if (globalOptions.pageID) {
    await utils
      .get(`https://www.facebook.com/${globalOptions.pageID}/messages/?section=messages&subsection=inbox`, jar, null, globalOptions)
      .then((resData) => {
        let url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split("\\").join("");
        url = url.substring(0, url.length - 1);
        return utils.get("https://www.facebook.com" + url, jar, null, globalOptions);
      });
  }

  log.info("login", "Đăng nhập thành công");

  callback(null, api);
}

function login(loginData, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  const globalOptions = {
    selfListen: false,
    listenEvents: true,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: false,
    autoReconnect: true,
    logRecordSize: 100,
    online: false,
    emitReady: false,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  };

  let prCallback = null;
  let returnPromise = null;

  if (typeof callback !== "function") {
    returnPromise = new Promise((resolve, reject) => {
      prCallback = (err, api) => {
        if (err) reject(err);
        else resolve(api);
      };
    });
    callback = prCallback;
  }

  setOptions(globalOptions, options);

  if (loginData.email && loginData.password) {
    loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
  } else if (loginData.appState) {
    loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
  } else {
    callback(new Error("Missing login credentials"));
  }

  return returnPromise;
}

module.exports = login;
