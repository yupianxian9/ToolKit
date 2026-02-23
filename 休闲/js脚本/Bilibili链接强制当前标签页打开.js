// ==UserScript==
// @name         Bilibili 链接强制当前标签页打开（评论区终极修复版）
// @namespace    Violentmonkey Scripts
// @match        *://*.bilibili.com/*
// @match        *://*.cycani.org/*
// @grant        none
// @version      1.7
// @author       -
// @description  彻底修复评论区视频链接新标签页打开问题，支持所有动态内容
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  // ======== 核心防御逻辑 ========

  // 1. 暴力锁定 window.open（应对B站高频重置）
  const lockWindowOpen = () => {
    window.open = new Proxy(window.open, {
      apply(target, thisArg, args) {
        const [url] = args;
        if (url) {
          args[1] = '_self'; // 强制修改为当前页打开
          const resolvedUrl = url.startsWith('//') ? location.protocol + url : url;
          args[0] = resolvedUrl;
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
  };
  lockWindowOpen();
  setInterval(lockWindowOpen, 200);

  // 2. 深度清理所有链接的 target 属性（含 Shadow DOM）
  const deepCleanLinks = (root = document) => {
    // 清理普通链接
    root.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute('target'));

    // 递归清理 Shadow DOM
    root.querySelectorAll('*').forEach(element => {
      if (element.shadowRoot) {
        deepCleanLinks(element.shadowRoot);
      }
    });
  };

  // 3. 增强版 MutationObserver（监听属性变化）
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'target') {
        mutation.target.removeAttribute('target');
      } else {
        deepCleanLinks();
      }
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['target']
  });

  // 4. 核弹级点击事件拦截（支持所有嵌套结构）
  document.addEventListener('click', (e) => {
    // 获取真实点击目标（穿透 Shadow DOM）
    const target = e.composedPath()[0];
    let el = target;
    while (el && el.tagName !== 'A') el = el.parentElement;

    if (el?.tagName === 'A' && el.href) {
      // 仅处理左键点击且无组合键
      if (e.button === 0 && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
        e.preventDefault();
        e.stopImmediatePropagation(); // 阻止B站后续逻辑

        // 处理协议相对链接
        const href = el.href.startsWith('//') ? location.protocol + el.href : el.href;
        location.href = href;
      }
    }
  }, true); // 捕获阶段优先执行

  // 初始清理
  deepCleanLinks();
})();
