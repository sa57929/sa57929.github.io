type StyleDictionary = Record<string, string>;

const APP = {
    state: {
        currentStyle: {
            name: "",
            file: "",
        },
        styles: {
            "Daniil Dankovsky": "style-1.css",
            "Artemy Burakh": "style-2.css",
            Clara: "style-3.css",
        } as StyleDictionary,
    },

    styleLinkId: "current-style",

    changeStyle(styleName: string) {
        const oldStyle = document.getElementById(this.styleLinkId);
        oldStyle?.remove();

        const styleFile = this.state.styles[styleName];
        const styleLink = document.createElement("link");

        styleLink.id = this.styleLinkId;
        styleLink.rel = "stylesheet";
        styleLink.href = styleFile;

        document.head.append(styleLink);

        this.state.currentStyle.name = styleName;
        this.state.currentStyle.file = styleFile;

        document.querySelectorAll<HTMLButtonElement>("#styleSelector button").forEach((button) => {
            button.classList.toggle("active", button.dataset.styleName === styleName);
        });
    },

    createStyleButtons() {
        const styleSelectorBox = document.getElementById("styleSelector")!;

        for (const styleName in this.state.styles) {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = styleName;
            button.dataset.styleName = styleName;
            button.addEventListener("click", () => this.changeStyle(styleName));

            styleSelectorBox.append(button);
        }
    },

    start() {
        this.createStyleButtons();
        const firstStyleName = Object.keys(this.state.styles)[0];
        this.changeStyle(firstStyleName);
    },
};

APP.start();
