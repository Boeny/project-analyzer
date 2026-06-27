const { makeDraggable, getFolder } = require("./utils");

module.exports = {Popup}

class Popup {
    constructor(props) {
        this.props = props;

        this.el = document.getElementById('popup');
        this.title = this.el.querySelector('.title');
        this.input = this.el.querySelector('.input');
        this.shouldParseCheckbox = this.el.querySelector('.should_parse');
        this.content = this.el.querySelector('.content');

        this.setEvents();

        makeDraggable(this.el, this.title);
    }

    setEvents() {
        const {filtersMap, isParsingChecked, onParsingCheck, onBackButtonClick, onCheckboxClick, onPathChange} = this.props;

        this.el.querySelector('.close').onclick = () => this.hide();
        this.el.querySelector('.back_button').onclick = () => {
            onBackButtonClick();
            this.onInputChange();
        };

        this.input.addEventListener('change', this.onInputChange);
        this.input.addEventListener('keydown', e => e.key === 'Enter' && this.onInputChange());

        this.shouldParseCheckbox.checked = isParsingChecked;
        this.shouldParseCheckbox.onclick = () => onParsingCheck(shouldParseCheckbox.checked);

        document.querySelectorAll('[class^=include_]').forEach(el => {
            el.checked = filtersMap[el.name];
            el.onclick = () => onCheckboxClick(el.name, el.checked);
        });
    }

    show() {
        this.el.style.display = 'block';
    }
    hide() {
        this.el.style.display = 'none';
    }
    setTitle(value) {
        this.input.innerText = value;
    }
    setTitleFromPath(path) {
        this.setTitle(getTitleFromPath(path));
    }
    setInputValue(value) {
        this.input.value = value || '/';
    }
    onInputChange = async (e) => {
        const {onPathChange} = this.props;
        const path = e ? e.target.value : this.input.value;

        this.setTitleFromPath(path);
        this.content.innerHTML = '';

        onPathChange(path);
    }
    toggleShouldParseCheckboxVisibility(isVisible) {
        this.shouldParseCheckbox.style.visibility = isVisible ? 'visible' : 'hidden';
    }
}
