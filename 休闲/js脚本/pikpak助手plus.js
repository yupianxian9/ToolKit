// ==UserScript==
// @name         pikpak助手plus
// @namespace    http://tampermonkey.net/
// @version      1.2.2
// @author       jdysya
// @description  pikpak网盘助手的增强版，搭配代理可实现直连下载，支持推送文件夹到aria2中!
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mypikpak.com
// @match        https://mypikpak.net/*
// @match        https://mypikpak.com/*
// @match        https://pikpak.me/*
// @match        https://pikpakdrive.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.4.37/dist/vue.global.prod.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(a=>{const o=document.createElement("style");o.dataset.source="vite-plugin-monkey",o.innerText=a,document.head.appendChild(o)})(" .dialog[data-v-050d8506]{position:absolute;top:20%;left:50%;transform:translate(-50%);background:#fff;z-index:10000;padding:30px;box-shadow:0 0 50px #000;border-radius:8px}.dialog .close[data-v-050d8506]{position:absolute;right:10px;top:10px;font-size:30px;cursor:pointer;color:#999}.movies[data-v-050d8506]{margin-top:10px;height:450px;overflow:auto}.movies li[data-v-050d8506]{margin-top:10px}.movies li input[data-v-050d8506]{margin-right:10px}.footer[data-v-050d8506]{margin-top:20px;display:flex;flex-direction:row-reverse}.dialog[data-v-e00750d4]{position:absolute;top:20%;left:50%;transform:translate(-50%);background:#fff;z-index:10000;padding:30px;box-shadow:0 0 50px #000;border-radius:8px}.dialog .close[data-v-e00750d4]{position:absolute;right:10px;top:10px;font-size:30px;cursor:pointer;color:#999}.footer[data-v-e00750d4]{margin-top:20px;display:flex;flex-direction:row-reverse}.form[data-v-e00750d4]{margin-top:20px}.xz-input[data-v-e00750d4]{border:#d9d9d9 1px solid;margin-bottom:10px;padding:5px;margin-top:5px}.aria2-tip[data-v-57ad7c2f]{padding:10px;background:rgba(0,0,0,.8);position:absolute;top:30px;left:50%;transform:translateY(-50%);color:#fff;border-radius:8px}.btns[data-v-c13a86b4]{display:flex;flex-direction:row-reverse;padding-right:10px;padding-top:20px}.btns li[data-v-c13a86b4]{cursor:pointer;margin-right:10px} ");

(function(vue) {
  "use strict";
  function getPlatform() {
    let u = navigator.userAgent;
    let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
    let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    if (isAndroid) {
      return "Android";
    } else if (isIOS) {
      return "IOS";
    } else {
      return "PC";
    }
  }
  var monkeyWindow = window;
  var GM_xmlhttpRequest = /* @__PURE__ */ (() => monkeyWindow.GM_xmlhttpRequest)();
  function post(url, data, headers, type) {
    data = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url,
        headers,
        data,
        responseType: type || "json",
        onload: (res) => {
          type === "blob" ? resolve(res) : res.response ? resolve(res.response || res.responseText) : reject(res);
        },
        onerror: (err) => {
          reject(err);
        }
      });
    });
  }
  function postData(url = "", data = {}, customHeaders = {}, method = "GET") {
    ({
      method,
      // *GET, POST, PUT, DELETE, etc.
      mode: "cors",
      // no-cors, *cors, same-origin
      cache: "no-cache",
      // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin",
      // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
        ...customHeaders
      },
      redirect: "follow",
      // manual, *follow, error
      referrerPolicy: "no-referrer"
    });
    if (method === "GET") {
      return fetch(url, {
        method: "GET",
        // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        // no-cors, *cors, same-origin
        cache: "no-cache",
        // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin",
        // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
          ...customHeaders
        },
        redirect: "follow",
        // manual, *follow, error
        referrerPolicy: "no-referrer"
        // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      }).then((response) => response.json());
    } else {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject({});
            }
          }
        };
        xhr.open(method, url);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.send(JSON.stringify(data));
      });
    }
  }
  function getHeader() {
    let token = "";
    let captcha = "";
    for (let i = 0; i < 40; i++) {
      let key = window.localStorage.key(i);
      if (key === null)
        break;
      if (key && key.startsWith("credentials")) {
        let tokenData = JSON.parse(window.localStorage.getItem(key));
        token = tokenData.token_type + " " + tokenData.access_token;
        continue;
      }
      if (key && key.startsWith("captcha")) {
        let tokenData = JSON.parse(window.localStorage.getItem(key));
        captcha = tokenData.captcha_token;
      }
    }
    return {
      Authorization: token,
      "x-device-id": window.localStorage.getItem("deviceid"),
      "x-captcha-token": captcha
    };
  }
  function getList(parent_id) {
    let url = `https://api-drive.mypikpak.com/drive/v1/files?thumbnail_size=SIZE_MEDIUM&limit=500&parent_id=${parent_id}&with_audit=true&filters=%7B%22phase%22%3A%7B%22eq%22%3A%22PHASE_TYPE_COMPLETE%22%7D%2C%22trashed%22%3A%7B%22eq%22%3Afalse%7D%7D`;
    return postData(url, {}, getHeader());
  }
  function getDownload(id) {
    for (let i = 0; i < 40; i++) {
      let key = window.localStorage.key(i);
      if (key === null)
        break;
      if (key && key.startsWith("credentials")) {
        let tokenData = JSON.parse(window.localStorage.getItem(key));
        tokenData.token_type + " " + tokenData.access_token;
        continue;
      }
      if (key && key.startsWith("captcha")) {
        let tokenData = JSON.parse(window.localStorage.getItem(key));
        tokenData.captcha_token;
      }
    }
    let header = getHeader();
    return postData("https://api-drive.mypikpak.com/drive/v1/files/" + id + "?", {}, header);
  }
  function pushToAria(url, data) {
    if (["Android", "IOS"].includes(getPlatform()) && !GM_xmlhttpRequest) {
      return postData(url, data, {}, "POST");
    } else {
      return post(url, data, {}, "");
    }
  }
  for (let i = 0; i < 999; i++) {
    let key = window.localStorage.key(i);
    console.log(key);
  }
  const AriaDownloadDialog_vue_vue_type_style_index_0_scoped_050d8506_lang = "";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _withScopeId$1 = (n) => (vue.pushScopeId("data-v-050d8506"), n = n(), vue.popScopeId(), n);
  const _hoisted_1$3 = {
    key: 0,
    style: { "width": "60%" },
    class: "dialog"
  };
  const _hoisted_2$1 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("h2", null, "请勾选你要下载的", -1));
  const _hoisted_3$1 = { class: "movies" };
  const _hoisted_4$1 = ["id", "value"];
  const _sfc_main$3 = {
    __name: "AriaDownloadDialog",
    props: {
      show: Boolean
    },
    emits: ["update:show", "msg"],
    setup(__props, { emit: __emit }) {
      const props = __props;
      const emits = __emit;
      const list = vue.ref([]);
      const selected = vue.ref([]);
      const checkedAll = vue.ref(false);
      const selectedItems = vue.ref([]);
      const isForbidden = vue.ref(false);
      vue.watch(
        () => props.show,
        (val) => {
          if (val) {
            const tempList = [];
            let parent_id = window.location.href.split("/").pop();
            if (parent_id == "all")
              parent_id = "";
            emits("msg", "开始加载文件列表，请稍等");
            getList(parent_id).then((res) => {
              res.files.forEach((item) => {
                tempList.push({ id: item.id, name: item.name, type: item.kind });
              });
              list.value = tempList;
            });
          }
        }
      );
      const close = () => {
        selected.value = [];
        checkedAll.value = false;
        isForbidden.value = false;
        emits("update:show", false);
      };
      const onCheckAll = () => {
        if (checkedAll.value) {
          selected.value = list.value.map((item, index) => index);
        } else {
          selected.value = [];
        }
      };
      const onCheck = () => {
        checkedAll.value = selected.value.length === list.value.length;
      };
      const getAllList = async () => {
        let count = 0;
        emits("msg", "开始获取文件内容");
        selectedItems.value = [];
        for (let index of selected.value) {
          selectedItems.value.push(list.value[index]);
        }
        for (let item of selectedItems.value) {
          if (item.type == "drive#folder") {
            let filesList = await getList(item.id);
            emits("msg", `已获取到${++count}个文件`);
            filesList.files.forEach((fileItem) => selectedItems.value.push({ id: fileItem.id, name: fileItem.name, type: fileItem.kind, path: (item.path || "") + "/" + item.name }));
          }
        }
        selectedItems.value = selectedItems.value.filter((item) => item.type == "drive#file");
      };
      const pushBefore = async () => {
        if (!isForbidden.value) {
          isForbidden.value = true;
          await getAllList();
          push();
        } else {
          emits("msg", "已经开始推送了");
        }
      };
      const push = async () => {
        let total = selectedItems.value.length;
        let success = 0;
        let fail = 0;
        let ariaHost = window.localStorage.getItem("ariaHost") || "";
        let ariaPath = window.localStorage.getItem("ariaPath") || "";
        let ariaToken = window.localStorage.getItem("ariaToken") || "";
        let ariaParams = window.localStorage.getItem("ariaParams") || "";
        let errorMSG = "";
        let retryList = [];
        if (!ariaHost) {
          emits("msg", "请先配置aria2");
          close();
          return;
        }
        console.log(`共${selectedItems.value.length}个项目`);
        let testIndex = 0;
        for (let item of selectedItems.value) {
          getDownload(item.id).then((res) => {
            if (res.error_description) {
              emits("msg", `失败原因: ${res.error_description} 请刷新！`);
              return;
            }
            emits("msg", `第${testIndex + 1}个项目下载链接获取成功`);
            console.log(`第${testIndex + 1}个项目下载链接获取成功`);
            let ariaData = {
              id: (/* @__PURE__ */ new Date()).getTime(),
              jsonrpc: "2.0",
              method: "aria2.addUri",
              params: [
                [res.web_content_link],
                { out: res.name }
              ]
            };
            if (ariaPath) {
              ariaData.params[1].dir = ariaPath + (item.path || "");
            }
            if (ariaParams) {
              const customParams = ariaParams.split(";");
              customParams.forEach((item2) => {
                const customParam = item2.split("=");
                ariaData.params[1][customParam[0]] = customParam[1];
              });
            }
            ariaToken && ariaData.params.unshift(`token:${ariaToken}`);
            pushToAria(ariaHost, ariaData).then((ariares2) => {
              if (ariares2.result) {
                success++;
              } else {
                console.log(ariares2);
                console.log(ariaData);
                errorMSG = ariares2.error.message === "Unauthorized" ? "密钥不对" : "推送失败";
                fail++;
              }
            }).catch((e) => {
              console.log(ariares);
              console.log(ariaData);
              errorMSG = `${e.statusText} 请检测配置`;
              emits("msg", `失败原因: ${e.statusText}`);
              fail++;
            }).finally(() => {
              total--;
              if (total === 0) {
                emits("msg", `成功：${success} 失败: ${fail} ${fail !== 0 ? "失败原因" + errorMSG : ""}`);
                console.info(`成功：${success} 失败: ${fail} ${fail !== 0 ? "失败原因" + errorMSG : ""}`);
                if (retryList.length > 0) {
                  console.log(retryList);
                  emits("msg", `即将重试${retryList.length}个项目`);
                  console.log(`即将重试${retryList.length}个项目`);
                  selectedItems.value = retryList;
                  retryList = [];
                  push();
                } else {
                  close();
                }
              }
            });
          }).catch((e) => {
            console.warn(`第${testIndex + 1}个项目下载链接获取失败`);
            retryList.push(selectedItems.value[testIndex]);
            fail++;
            total--;
          }).finally(() => {
            testIndex++;
          });
        }
      };
      return (_ctx, _cache) => {
        return __props.show ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$3, [
          _hoisted_2$1,
          vue.createElementVNode("div", {
            class: "close",
            onClick: close
          }, "×"),
          vue.withDirectives(vue.createElementVNode("input", {
            onChange: onCheckAll,
            style: { "margin": "10px 10px 0 0" },
            type: "checkbox",
            id: "checkbox",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => checkedAll.value = $event)
          }, null, 544), [
            [vue.vModelCheckbox, checkedAll.value]
          ]),
          vue.createTextVNode("全选 "),
          vue.createElementVNode("ul", _hoisted_3$1, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(list.value, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("li", {
                key: item.id
              }, [
                vue.withDirectives(vue.createElementVNode("input", {
                  onChange: onCheck,
                  type: "checkbox",
                  id: item.id,
                  value: index,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => selected.value = $event)
                }, null, 40, _hoisted_4$1), [
                  [vue.vModelCheckbox, selected.value]
                ]),
                vue.createTextVNode(vue.toDisplayString(item.name), 1)
              ]);
            }), 128))
          ]),
          vue.createElementVNode("div", { class: "footer" }, [
            vue.createElementVNode("div", {
              class: "btn el-button el-button--primary",
              onClick: pushBefore
            }, "推送到aria2")
          ])
        ])) : vue.createCommentVNode("", true);
      };
    }
  };
  const AriaDownloadDialog = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-050d8506"]]);
  const AriaConfigDialog_vue_vue_type_style_index_0_scoped_e00750d4_lang = "";
  const _withScopeId = (n) => (vue.pushScopeId("data-v-e00750d4"), n = n(), vue.popScopeId(), n);
  const _hoisted_1$2 = {
    key: 0,
    style: { "width": "400px" },
    class: "dialog"
  };
  const _hoisted_2 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("h2", null, "请配置你的aria2", -1));
  const _hoisted_3 = { class: "form" };
  const _hoisted_4 = { class: "form-item" };
  const _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("span", null, "服务器:", -1));
  const _hoisted_6 = { class: "el-input xz-input" };
  const _hoisted_7 = { class: "form-item" };
  const _hoisted_8 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("span", null, "路径:", -1));
  const _hoisted_9 = { class: "el-input xz-input" };
  const _hoisted_10 = { class: "form-item" };
  const _hoisted_11 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("span", null, "密钥:", -1));
  const _hoisted_12 = { class: "el-input xz-input" };
  const _hoisted_13 = { class: "form-item" };
  const _hoisted_14 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("span", null, "自定义参数:", -1));
  const _hoisted_15 = { class: "el-input xz-input" };
  const _hoisted_16 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("br", null, null, -1));
  const _hoisted_17 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("br", null, null, -1));
  const _sfc_main$2 = {
    __name: "AriaConfigDialog",
    props: {
      show: Boolean
    },
    emits: ["update:show", "msg"],
    setup(__props, { emit: __emit }) {
      const emits = __emit;
      const close = () => {
        emits("update:show", false);
      };
      let ariaHost = window.localStorage.getItem("ariaHost") || "";
      let ariaPath = window.localStorage.getItem("ariaPath") || "";
      let ariaToken = window.localStorage.getItem("ariaToken") || "";
      let ariaParams = window.localStorage.getItem("ariaParams") || "";
      const form = vue.reactive({
        host: ariaHost,
        path: ariaPath,
        token: ariaToken,
        params: ariaParams
      });
      const save = () => {
        window.localStorage.setItem("ariaHost", form.host);
        window.localStorage.setItem("ariaPath", form.path);
        window.localStorage.setItem("ariaToken", form.token);
        window.localStorage.setItem("ariaParams", form.params);
        close();
        emits("msg", "保存成功！");
      };
      return (_ctx, _cache) => {
        return __props.show ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, [
          _hoisted_2,
          vue.createElementVNode("div", {
            class: "close",
            onClick: close
          }, "×"),
          vue.createElementVNode("div", _hoisted_3, [
            vue.createElementVNode("div", _hoisted_4, [
              _hoisted_5,
              vue.createElementVNode("div", _hoisted_6, [
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.host = $event),
                  class: "el-input__inner"
                }, null, 512), [
                  [vue.vModelText, form.host]
                ])
              ])
            ]),
            vue.createElementVNode("div", _hoisted_7, [
              _hoisted_8,
              vue.createElementVNode("div", _hoisted_9, [
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.path = $event),
                  class: "el-input__inner"
                }, null, 512), [
                  [vue.vModelText, form.path]
                ])
              ])
            ]),
            vue.createElementVNode("div", _hoisted_10, [
              _hoisted_11,
              vue.createElementVNode("div", _hoisted_12, [
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.token = $event),
                  class: "el-input__inner"
                }, null, 512), [
                  [vue.vModelText, form.token]
                ])
              ])
            ]),
            vue.createElementVNode("div", _hoisted_13, [
              _hoisted_14,
              vue.createElementVNode("div", _hoisted_15, [
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.params = $event),
                  class: "el-input__inner"
                }, null, 512), [
                  [vue.vModelText, form.params]
                ])
              ]),
              vue.createTextVNode(" 参数名=参数;参数名2=参数"),
              _hoisted_16,
              vue.createTextVNode("自定义参数例子:"),
              _hoisted_17,
              vue.createTextVNode(" all-proxy=http://192.168.88.189;split=1 ")
            ])
          ]),
          vue.createElementVNode("div", { class: "footer" }, [
            vue.createElementVNode("div", {
              class: "btn el-button el-button--primary",
              onClick: save
            }, "保存")
          ])
        ])) : vue.createCommentVNode("", true);
      };
    }
  };
  const AriaConfigDialog = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-e00750d4"]]);
  const Aria2Toast_vue_vue_type_style_index_0_scoped_57ad7c2f_lang = "";
  const _hoisted_1$1 = {
    key: 0,
    class: "aria2-tip"
  };
  const _sfc_main$1 = {
    __name: "Aria2Toast",
    setup(__props, { expose: __expose }) {
      const show = vue.ref(false);
      const open = () => {
        show.value = true;
        setTimeout(() => {
          show.value = false;
        }, 3e3);
      };
      __expose({ open });
      return (_ctx, _cache) => {
        return show.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ])) : vue.createCommentVNode("", true);
      };
    }
  };
  const Aria2Toast = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-57ad7c2f"]]);
  const App_vue_vue_type_style_index_0_scoped_c13a86b4_lang = "";
  const _hoisted_1 = {
    key: 0,
    class: "btns"
  };
  const _sfc_main = {
    __name: "App",
    setup(__props) {
      const downloadShow = vue.ref(false);
      const configShow = vue.ref(false);
      const tip = vue.ref("");
      const toastRef = vue.ref(null);
      const showPlugin = vue.ref(false);
      const showToast = (val) => {
        tip.value = val;
        toastRef.value.open();
      };
      if (location.pathname !== "/") {
        showPlugin.value = true;
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          showPlugin.value ? (vue.openBlock(), vue.createElementBlock("ul", _hoisted_1, [
            vue.createElementVNode("li", {
              class: "btn",
              onClick: _cache[0] || (_cache[0] = ($event) => downloadShow.value = true)
            }, "aria2下载"),
            vue.createElementVNode("li", {
              class: "btn",
              onClick: _cache[1] || (_cache[1] = ($event) => configShow.value = true)
            }, "aria2配置")
          ])) : vue.createCommentVNode("", true),
          vue.createVNode(AriaDownloadDialog, {
            onMsg: showToast,
            show: downloadShow.value,
            "onUpdate:show": _cache[2] || (_cache[2] = ($event) => downloadShow.value = $event)
          }, null, 8, ["show"]),
          vue.createVNode(AriaConfigDialog, {
            onMsg: showToast,
            show: configShow.value,
            "onUpdate:show": _cache[3] || (_cache[3] = ($event) => configShow.value = $event)
          }, null, 8, ["show"]),
          vue.createVNode(Aria2Toast, {
            ref_key: "toastRef",
            ref: toastRef
          }, {
            default: vue.withCtx(() => [
              vue.createTextVNode(vue.toDisplayString(tip.value), 1)
            ]),
            _: 1
          }, 512)
        ], 64);
      };
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c13a86b4"]]);
  document.cookie = "pp_access_to_visit=true";
  setTimeout(() => {
    vue.createApp(App).mount(
      (() => {
        let pikpakContainer = document.getElementById("app");
        const app = document.createElement("div");
        document.body.insertBefore(app, pikpakContainer);
        return app;
      })()
    );
  }, 1e3);
})(Vue);
