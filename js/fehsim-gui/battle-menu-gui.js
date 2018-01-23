export class BattleMenuGui {

    /**
     * 
     * @param {HTMLElement} element 
     */
    init(element) {
        element.innerHTML = `
            <div class='app-header'>
                <button style='float:left;' onclick='this.parentElement.parentElement.classList.toggle("hidden")'>=</button>
            </div>
            <div class='app-container'>
                <div class='app-team'>
                    <div class='app-header'><h1>Hello</h1></div>
                </div>
                <div class='app-team'>
                    <div class='app-header'><h1>Hello</h1></div>
                </div>
                <div class='app-team'>
                    <div class='app-header'><h1>Hello</h1></div>
                </div>
                <div class='app-team'>
                    <div class='app-header'><h1>Hello</h1></div>
                </div>
                <div class='app-team'>
                    <div class='app-header'><h1>Hello</h1></div>
                </div>
            </div>
        `;
    }
}