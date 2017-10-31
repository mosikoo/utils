/**
 * requestAnimationFramePolyfill
 * from 'ant-design'
 */
const availablePrefixs = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill() {
  let lastTime = 0;
  return function(callback) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

function getRequestAnimationFrame() {
  if (typeof window === 'undefined') {
    return () => {};
  }
  if (window.requestAnimationFrame) {
    // https://github.com/vuejs/vue/issues/4465
    return window.requestAnimationFrame.bind(window);
  }

  const prefix = availablePrefixs.filter(key => `${key}RequestAnimationFrame` in window)[0];

  return prefix
    ? window[`${prefix}RequestAnimationFrame`]
    : requestAnimationFramePolyfill();
}

function cancelRequestAnimationFrame(id) {
  if (typeof window === 'undefined') {
    return null;
  }
  if (window.cancelAnimationFrame) {
    return window.cancelAnimationFrame(id);
  }
  const prefix = availablePrefixs.filter(key =>
    `${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window,
  )[0];

  return prefix ?
    (window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`]).call(this, id)
    : clearTimeout(id);
}
/*********************************** */

function getScroll(target, isTop = true) {
  if (target === undefined) {
    return 0;
  }
  const props = target === window ? ['pageXOffset', 'pageYOffset'] : ['scrollLeft', 'scrollTop'];
  const index = isTop ? 1 : 0;
  const ret = target[props[index]];
  return ret || 0;
}

/**
 * 贝塞尔曲线-in-out
 * @param {*} t start time
 * @param {*} b start point
 * @param {*} c end point
 * @param {*} d end time
 */
function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  }
  return cc / 2 * ((t -= 2) * t * t + 2) + b;
}

// scrollTop + rectTop = scroll
const requestAnimateFrame = getRequestAnimationFrame();
/**
 * 滚动函数
 * @param {dom} target 目标dom -- child
 * @param {dom} offsetTarget 需要滚动的dom -- parent
 * @param {number} offsetTop 偏移量
 * @param {function} callback 
 */
function scrollToTop(target, offsetTarget, offsetTop = 0, callback = () => {}) {
  const targetRect = target.getBoundingClientRect();
  rectTop = targetRect.top || 0;
  if (offsetTarget !== window) {
    const offsetTargetRect = offsetTarget.getBoundingClientRect(); 
    rectTop -= offsetTargetRect.top;
  }
  const targetScrollTop = getScroll(offsetTarget);
  const realScroll = targetScrollTop + rectTop - offsetTop;
  let startTime = Date.now();
  const offsetTarget2 = offsetTarget === window ? window.document.documentElement : offsetTarget;
  function step() {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    // time: 0 -> 450, offset: targetScrollTop -> realScroll
    offsetTarget2.scrollTop = easeInOutCubic(time, targetScrollTop, realScroll, 450);
    if (time < 450) {
      requestAnimateFrame(step);
    } else {
      callback();
    }
  }
  requestAnimateFrame(step);
}
