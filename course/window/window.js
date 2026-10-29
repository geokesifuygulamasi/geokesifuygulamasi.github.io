export class Window
{
    static highestZIndex = 1000;

    /**
     * @param {string|null} parentElementID
     * @param {string} title
     * @param {string} name
     */
    constructor(parentElementID, title, name)
    {
        this.name = name;
        this.title = title;

        this.windowID = name + "_window";

        if(document.getElementById(this.windowID) != null)
        {
            throw new Error("[Window] window already exists!");
        }

        if(parentElementID == null)
        {
            this.parent = document.body;
        }
        else
        {
            this.parent = document.getElementById(parentElementID);

            if(!this.parent)
            {
                throw new Error(
                    `[Window] parent element "${parentElementID}" does not exist!`
                );
            }
        }

        this.element = document.createElement("div");

        this.element.id = this.windowID;
        this.element.classList.add("window");


        this.titleElement = document.createElement("div");
        this.titleElement.classList.add("window-title");


        this.titleTextElement = document.createElement("span");
        this.titleTextElement.classList.add("window-title-text");
        this.titleTextElement.textContent = title;


        this.closeButton = document.createElement("button");
        this.closeButton.classList.add("window-close");
        this.closeButton.textContent = "X";

        this.contentElement = document.createElement("div");

        this.contentElement.classList.add("window-content");

        this.titleElement.appendChild(this.titleTextElement);
        this.titleElement.appendChild(this.closeButton);

        this.element.appendChild(this.titleElement);
        this.element.appendChild(this.contentElement);

        this.parent.appendChild(this.element);

        this.destroyed = false;
        this.dragging = false;

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.resizeObserver = null;

        this.closeCallbacks = [];
        this.moveCallbacks = [];
        this.focusCallbacks = [];

        this.addBaseFunctionality();
    }

    addBaseFunctionality()
    {
        this.addDragFunctionality();
        this.addFocusFunctionality();
        this.addCloseFunctionality();
    }

    addDragFunctionality()
    {
        this._pointerDown = (event) =>
        {
            if(this.destroyed)
                return;

            this.bringToFront();

            const rect = this.element.getBoundingClientRect();

            this.dragging = true;

            this.dragOffsetX = event.clientX - rect.left;
            this.dragOffsetY = event.clientY - rect.top;

            this.titleElement.setPointerCapture(event.pointerId);
        };


        this._pointerMove = (event) =>
        {
            if(!this.dragging || this.destroyed)
                return;

            let x = event.clientX - this.dragOffsetX;
            let y = event.clientY - this.dragOffsetY;

            const width = this.element.offsetWidth;
            const height = this.element.offsetHeight;

            x = Math.max(
                0,
                Math.min(x, window.innerWidth - width)
            );

            y = Math.max(
                0,
                Math.min(y, window.innerHeight - height)
            );

            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;

            this.moveCallbacks.forEach((fn) => { fn(x, y); })
        };


        this._pointerUp = (event) =>
        {
            this.dragging = false;

            if(this.titleElement.hasPointerCapture(event.pointerId))
            {
                this.titleElement.releasePointerCapture(event.pointerId);
            }
        };


        this.titleElement.addEventListener(
            "pointerdown",
            this._pointerDown
        );

        this.titleElement.addEventListener(
            "pointermove",
            this._pointerMove
        );

        this.titleElement.addEventListener(
            "pointerup",
            this._pointerUp
        );

        this.titleElement.addEventListener(
            "pointercancel",
            this._pointerUp
        );
    }


    addCloseFunctionality()
    {
        this._closeButtonPointerDown = (event) =>
        {
            event.stopPropagation();
        };

        this._closeButtonPointerUp = (event) =>
        {
            event.stopPropagation();

            this._closeButtonClick();
        };

        this._closeButtonClick = () =>
        {
            let destroyThis = true;

            this.closeCallbacks.forEach((fn) =>
            {
                destroyThis =
                    (fn() ?? true) &&
                    destroyThis;
            });

            if(destroyThis)
            {
                this.destroy();
            }
        };

        this.closeButton.addEventListener(
            "pointerdown",
            this._closeButtonPointerDown
        );

        this.closeButton.addEventListener(
            "pointerup",
            this._closeButtonPointerUp
        );
    }

    addFocusFunctionality()
    {
        this._focus = () =>
        {
            this.focusCallbacks.forEach((fn) => { fn(); })
            this.bringToFront();
        };

        this.element.addEventListener(
            "pointerdown",
            this._focus
        );
    }


    bringToFront()
    {
        Window.highestZIndex++;

        this.element.style.zIndex =
            Window.highestZIndex;
    }

    resize(width, height)
    {
        if(this.destroyed)
            return;

        if(width != null)
        {
            this.element.style.width =
                `${width}px`;
        }

        if(height != null)
        {
            this.element.style.height =
                `${height}px`;
        }
    }

    setPosition(x, y)
    {
        if(this.destroyed)
            return;

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    setTitle(title)
    {
        if(this.destroyed)
            return;

        this.title = title;

        this.titleTextElement.textContent =
            title;
    }

    add(element)
    {
        if(this.destroyed)
            return;

        this.contentElement.appendChild(element);
    }


    remove(element)
    {
        if(this.destroyed)
            return;

        if(element.parentElement === this.contentElement)
        {
            this.contentElement.removeChild(element);
        }
    }


    clear()
    {
        if(this.destroyed)
            return;

        this.contentElement.replaceChildren();
    }


    show()
    {
        if(this.destroyed)
            return;

        this.element.style.display = "";
        this.bringToFront();
    }

    hide()
    {
        if(this.destroyed)
            return;

        this.element.style.display = "none";
    }

    addCloseCallback(fn)
    {
        this.closeCallbacks.push(fn);
    }
    clearCloseCallback()
    {
        this.closeCallbacks.clear();
    }

    addMoveCallback(fn)
    {
        this.moveCallbacks.push(fn);
    }
    clearMoveCallback()
    {
        this.moveCallbacks.clear();
    }

    addFocusCallback(fn)
    {
        this.focusCallbacks.push(fn);
    }
    clearFocusCallback()
    {
        this.focusCallbacks.clear();
    }


    destroy()
    {
        if(this.destroyed)
            return;

        console.log("destroying");

        this.closeCallbacks.length = 0;
        this.moveCallbacks.length = 0;
        this.focusCallbacks.length = 0;
        
        this.dragging = false;

        this.titleElement.removeEventListener(
            "pointerdown",
            this._pointerDown
        );

        this.titleElement.removeEventListener(
            "pointermove",
            this._pointerMove
        );

        this.titleElement.removeEventListener(
            "pointerup",
            this._pointerUp
        );

        this.titleElement.removeEventListener(
            "pointercancel",
            this._pointerUp
        );

        this.closeButton.removeEventListener(
            "pointerdown",
            this._closeButtonPointerDown
        );
        
        this.closeButton.removeEventListener(
            "pointerup",
            this._closeButtonPointerUp
        );

        this.element.removeEventListener(
            "pointerdown",
            this._focus
        );

        // Remove DOM element
        this.element.remove();

        this.destroyed = true;

        // References
        this.parent = null;
        this.element = null;
        this.titleElement = null;
        this.titleTextElement = null;
        this.closeButton = null;
        this.contentElement = null;
    }

    
}