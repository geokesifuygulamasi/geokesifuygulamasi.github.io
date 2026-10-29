export function createContactBar(elementID)
{
    const footer = document.getElementById(elementID);
    if(footer === null)
    {
        throw new Error("[createNavBar] passed invalid element ID");
    }
    if(!(footer instanceof HTMLElement && footer.tagName === "FOOTER"))
    {
        throw new Error("[createNavBar] passed an element ID of a non <footer> element");
    }
    footer.innerHTML= 
    `
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
    `
}