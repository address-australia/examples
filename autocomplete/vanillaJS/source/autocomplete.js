// Main object
function Autocomplete(id, token, resultsCallback, selectedCallback) {
    this.id = id;
    this.token = token;
    this.resultsCallback = resultsCallback;
    this.selectedCallback = selectedCallback;
    this.status = 'unloaded';
    this.API_URL = 'https://api.addressaustralia.com.au/v1';

    this.results = [];
    this.latestFetchTS = Date.now();
    this.selected = undefined;
    this.richResult = {};

    this._enrichById = (id) => {
        return fetch(`${this.API_URL}/enrich/id/${id}`, {
            method: 'GET',
            headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            })
            .then(res => res.json())
    }

    this._autocompleteAndHighlight = (searchInput) => {
        return fetch(`${this.API_URL}/autocomplete/highlight/${encodeURIComponent(searchInput)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        })
        .then(res => res.json())
    }

    this._selectAddress = (address) => {
        document.getElementById(`${this.id}-input`).value = address.address;
        this.results = [];
        this._renderResults();
        this._enrichById(address.id)
            .then(result => {
                this.richResult = result;
                if(this.selectedCallback){
                    this.selectedCallback(result);
                }
            })
            .catch(e => {
                console.error(e);
            })
    };

    this._renderResults = () => {
        const resultsElement = document.getElementById(`${this.id}-addressBarResults`);
        resultsElement.innerHTML = '';
        if (this.results.matches) {
            this.results.matches.forEach(result => {
                const p = document.createElement('p');
                p.innerHTML = result.highlighted;
                p.onclick = () => this._selectAddress(result);
                resultsElement.appendChild(p);
            })
        }
        // resultsElement.innerHTML = this.results.matches.map(result => `<p>${result.highlighted}</p>`).join('');
    }

    this._onchange = (e) => {
        const thisSearchTS = Date.now();
        this._autocompleteAndHighlight(e.target.value)
            .then(result => {
                // Save results if they are the latest
                if (thisSearchTS > this.latestFetchTS) {
                    this.latestFetchTS = thisSearchTS;
                    this.results = result;
                    this._renderResults();
                    if(this.resultsCallback) {
                        this.resultsCallback(result);
                    }
                }
            })
            .catch(e => {
                console.error(e);
            })
    }
    

    this._injectHTML = () => {
        // Find target
        const target = document.querySelector(`#${this.id}`);
        // Outer container
        const addressBarDiv = document.createElement('div');
        addressBarDiv.className = 'addressBar';
        // Input field container
        const inputFieldDiv = document.createElement('div');
        inputFieldDiv.className = 'input-field';
        // Input itself
        const inputField = document.createElement('input');
        inputField.id = `${this.id}-input`;
        inputField.oninput = this._onchange;
        inputField.placeholder = 'Search';
        // Results container
        const addressBarResultsDiv = document.createElement('div');
        addressBarResultsDiv.id = `${this.id}-addressBarResults`;
        addressBarResultsDiv.className = 'addressBarResults';

        inputFieldDiv.appendChild(inputField);
        inputFieldDiv.appendChild(addressBarResultsDiv);
        addressBarDiv.appendChild(inputFieldDiv);
        target.appendChild(addressBarDiv);
    }

    this.on = (eventType, callback) => {
        switch (eventType) {
            case 'result':
                this.resultsCallback = callback;
                break;
            case 'selected':
                this.selectedCallback = callback;
            default:
                break;
        }
    }

    this._injectHTML();

}
