import { RestRecipeProvider, BrowserProbe } from '../probnik/probnik.ts';


var probnik_pulses = 3;
var probnik_target_data = new Map();
var probnik_target_data_init = false;

var toggleButtonProbnik = document.getElementById('toggle-button-probnik');
var testingMessageProbnik = document.getElementById('testing-message-probnik');

var probnikTesterActive = false;
var probnikTesterTimer = null;

var recipeProvider = new RestRecipeProvider('/recipe');
var probnik_tester = new BrowserProbe(recipeProvider, onCompleteProbnik);


function onCompleteProbnik(data) {
    if (probnikTesterActive) {
        loadDataProbnik(data);
        let data_list = Object.values(probnik_target_data);
        data_list.sort((a, b) => {
            return a[3]/a[4] < b[3]/b[4] ? -1 : 1;
        });
        populateTable(data_list, 'result-table-probnik');
        probnikTesterTimer = setTimeout(runProbeProbnik, 500);
    }
}


function loadDataProbnik(data) {
    if (!probnik_target_data_init) {
        for (const target of data.data) {
            probnik_target_data.set(
                target.name,
                [target.name, Infinity, 0, 0, 0]
            );
        }
        probnik_target_data_init = true;
    }
    for (const target of data.data) {
        for (let i=0; i<probnik_pulses; i++) {
            probnik_target_data.set(target.name, [
                target.name,
                Math.min(probnik_target_data.get(target.name)[1], Math.round(target.data[i].d)),
                Math.max(probnik_target_data.get(target.name)[2], Math.round(target.data[i].d)),
                probnik_target_data.get(target.name)[3] + Math.round(target.data[i].d),
                probnik_target_data.get(target.name)[4] + 1
            ]);
        }
    }
}


function runProbeProbnik() {
    probnik_tester.start();
}


function toggleButtonProbnikHandler() {
    probnikTesterActive = !probnikTesterActive;
    toggleButtonProbnik.innerHTML = probnikTesterActive ? 'Stop' : 'Start';
    testingMessageProbnik.innerHTML = probnikTesterActive ? 'Testing...' : '';
    clearTimeout(probnikTesterTimer);
    if (probnikTesterActive)
        runProbeProbnik();
}


toggleButtonProbnik.addEventListener('click', toggleButtonProbnikHandler);
