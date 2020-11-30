// Opera 8.0+
export const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
console.log(`isOpera ${isOpera}`)

// Firefox 1.0+
export const isFirefox = typeof InstallTrigger !== 'undefined';
console.log(`isFirefox ${isFirefox}`)

const ua = window.navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

// Safari 3.0+ "[object HTMLElementConstructor]" 
export const isSafari = iOSSafari || /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
console.log(`isSafari ${isSafari}`)

// Internet Explorer 6-11
export const isIE = /*@cc_on!@*/false || !!document.documentMode;
console.log(`isIE ${isIE}`)

// Edge 20+
export const isEdge = !isIE && !!window.StyleMedia;
console.log(`isEdge ${isEdge}`)

// Chrome 1 - 79
export const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
console.log(`isChrome ${isChrome}`)

// Edge (based on chromium) detection
export const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
console.log(`isEdgeChromium ${isEdgeChromium}`)

// Blink engine detection
export const isBlink = (isChrome || isOpera) && !!window.CSS;
console.log(`isBlink ${isBlink}`)
