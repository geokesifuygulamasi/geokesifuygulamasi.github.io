export function createNavBar(elementID, hasHowWorks, hasContact)
{
    const header = document.getElementById(elementID);
    if(header === null)
    {
        throw new Error("[createNavBar] passed invalid element ID");
    }
    if(!(header instanceof HTMLElement && header.tagName === "HEADER"))
    {
        throw new Error("[createNavBar] passed an element ID of a non <header> element");
    }
    header.innerHTML = 
    `
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
                ${hasHowWorks ? `<a href="#nasil-calisir">Nasıl çalışır?</a>` : ""}
                ${hasContact ? `<a class="nav-cta" href="#iletisim">İletişim</a>` : ""}
                <a href="/courseSelector/index.html">Göster</a>
            </div>
        </nav>
    `
}