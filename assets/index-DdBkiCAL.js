var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(e,t,n){let r=document.getElementById(e);if(r===null)throw Error(`[createNavBar] passed invalid element ID`);if(!(r instanceof HTMLElement&&r.tagName===`HEADER`))throw Error(`[createNavBar] passed an element ID of a non <header> element`);r.innerHTML=`
        <nav class="navbar container" aria-label="Ana navigasyon">
            <a class="logo" href="/index.html" aria-label="GeoKeşif ana sayfa">
                <span class="logo-icon">
                    <svg viewBox="0 0 32 32" fill="none"
                         aria-hidden="true">
                        <path
                            d="M16 4L28 26H4L16 4Z"
                            stroke="#8b9cff"
                            stroke-width="2"
                            stroke-linejoin="round"
                        />
                        <circle cx="16" cy="4" r="2.5" fill="#8b9cff"/>
                        <circle cx="4" cy="26" r="2.5" fill="#8b9cff"/>
                        <circle cx="28" cy="26" r="2.5" fill="#8b9cff"/>
                    </svg>
                </span>

                <span>GeoKeşif</span>
            </a>
            <div class="nav-links">
                ${t?`<a href="#nasil-calisir">Nasıl çalışır?</a>`:``}
                ${n?`<a class="nav-cta" href="#iletisim">İletişim</a>`:``}
                <a href="/courseSelector/index.html">Göster</a>
            </div>
        </nav>
    `}var r=e((()=>{}));function i(e){let t=document.getElementById(e);if(t===null)throw Error(`[createNavBar] passed invalid element ID`);if(!(t instanceof HTMLElement&&t.tagName===`FOOTER`))throw Error(`[createNavBar] passed an element ID of a non <footer> element`);t.innerHTML=`
        <div class="footer-content container">
            <a class="logo" href="./index.html">
                <span>GeoKeşif</span>
            </a>

            <span>
                Geometriyi anlamak, keşfetmekle başlar.
            </span>

            <div class="footer-links">
                <a href="mailto:merttunafcn@gmail.com" target="_blank">
                    Geliştiricilerle iletişim
                </a>
            </div>
        </div>
    `}var a=e((()=>{}));t((()=>{r(),a(),n(`header`,!0,!0),i(`iletisim`)}))();