/********************************************************************************************************** */
//Ben McLeland
//Foosball ranking app

//TODO:
//Add server
//Make banner not move page
//Undo last game
/********************************************************************************************************** */


/********************************************************************************************************** */
//Classes
/********************************************************************************************************** */

//Creates a new team and sets initial win or loss
class Team {    
    constructor(teamName) {
        this.ranking = 0;
        this.name = teamName;
        this.elo = 1000;
        this.gamesWon = 0;
        this.gamesLost = 0;
    }
}

//Store Class: Handles Storage
class Store {
    //Get teams from storage
    static getTeams() {
        let teams;
        if(localStorage.getItem('teams') === null) {
            teams = [];
        } else {
            teams = JSON.parse(localStorage.getItem('teams'));
        }
        return teams;
    }

    //Delete teams in storage
    static deleteTeams() {
        let teams = [];
        localStorage.setItem('teams', JSON.stringify(teams));
    }

    //Update storage teams to running program teams
    static updateTeams() {
        let teams = [];

        for (let i=0; i< teamList.length; i++) {
            teams.push(teamList[i]);
        }

        localStorage.setItem('teams', JSON.stringify(teams));
    }

    //Gets players from storage
    static getPlayers() {
        let players;
        if(localStorage.getItem('players') === null) {
            players = [];
        } else {
            players = JSON.parse(localStorage.getItem('players'));
        }

        return players;
    }

    //Updates players in storage to running program data
    //DOESNT SORT
    static updatePlayers() {
        let players = [];

        for (let i=0; i< playerList.length; i++) {
            players.push(playerList[i]);
        }

        localStorage.setItem('players', JSON.stringify(players));
    }

    //Adds players to storage
    //DOESNT SORT
    static addPlayer(playerName) {
        let players = Store.getPlayers();
        players.push(playerName);
        localStorage.setItem('players', JSON.stringify(players));
    }

    //Delete players in storage
    static deletePlayers() {
        let players = [];
        localStorage.setItem('players', JSON.stringify(players));
    }
}

//UI Class: Handles UI Tasks
class UI {
    //Updates standings in UI
    static updateTeamList() {
        const list = document.querySelector('#team-list');

        list.innerHTML = '';

        for (let i=0; i<teamList.length; i++) {
            UI.addTeamtoList(teamList[i], i+1);
        }
    }

    //Adds one team to the list
    static addTeamtoList(team, rank) {
        const list = document.querySelector('#team-list');

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${rank}</td>
            <td>${team.name}</td>
            <td>${team.gamesWon}</td>
            <td>${team.gamesLost}</td>
            <td>${Math.round(team.elo)}</td>
        `;

        list.appendChild(row);
    }

    //NEW
    static updatePlayers() {
        for (let i = 1; i <= 4; i++) {
            const list = document.querySelector(`#player${i}`);
            const length = list.options.length;

            for (let i = 1; i < length; i++) {
                list.options[1] = null;
            }
        }

        for (let i=0; i<playerList.length; i++) {
            UI.addPlayertoList(playerList[i]);
        }
    }

    //Adds each player to UI
    static addPlayertoList(player) {
        for (let i=1; i<=4; i++) {
            const list = document.querySelector(`#player${i}`);
    
            const element = document.createElement('option');
    
            element.value = player;
            element.text = player;
    
            list.appendChild(element);
        }
    }

    //Shows alert
    static showAlert(message, classname) {
        const div = document.createElement('div');
        div.className = `alert alert-${classname}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#team-form');
        container.insertBefore(div, form);

        //Vanish in 5 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 5000);
    }

    //Resets selection fields
    static clearFields() {
        document.querySelector('#player1').value = '';
        document.querySelector('#player2').value = '';
        document.querySelector('#player3').value = '';
        document.querySelector('#player4').value = '';
    }
}

/********************************************************************************************************** */
//Initial actions
/********************************************************************************************************** */

//RESET TEAMS
//Store.deleteTeams();

//RESET PLAYERS
//Store.deletePlayers();

//Constant to determine changes over time
const K = 50;

//Grab teams from storage
var teamList = Store.getTeams();
UI.updateTeamList();

//Hide Add New Player
const x = document.getElementById("new-player-form");
x.style.display = "none";

//Get players
var playerList = Store.getPlayers();
UI.updatePlayers();

/********************************************************************************************************** */
//Event Listeners
/********************************************************************************************************** */

//Event: Display team rankings
document.addEventListener('DOMContentLoaded', UI.updateTeamList);
//document.addEventListener('DOMContentLoaded', UI.updatePlayers);

//Event: Add game
document.querySelector('#team-form').addEventListener('submit', (e) => {
    //Prevent actual submit
    e.preventDefault();

    //Set teamlist to stored teams
    teamList = Store.getTeams();

    //Get form values
    var e = document.getElementById("player1");
    const player1 = e.options[e.selectedIndex].value;
    var e = document.getElementById("player2");
    const player2 = e.options[e.selectedIndex].value;
    var e = document.getElementById("player3");
    const player3 = e.options[e.selectedIndex].value;
    var e = document.getElementById("player4");
    const player4 = e.options[e.selectedIndex].value;

    //Validate
    if (!validateGame(player1, player2, player3, player4)) {
        UI.showAlert('Invalid Input', 'danger');
    } else {
        //Get team names
        const team1Name = getTeamName(player1, player2);
        const team2Name = getTeamName(player3, player4);

        //Add teams if they don't exist
        addNewTeam(team1Name);
        addNewTeam(team2Name);

        //Calculates new team's elo ratings
        calculateElo(team1Name, team2Name);

        //Sorts teams by elo
        sortTeams();

        //Updates then stores teams
        Store.updateTeams();

        //update UI
        UI.updateTeamList();
        
        //const message = '${team1Name} beat ${team2Name}!';
        //Show success
        UI.showAlert(`${team1Name} beat ${team2Name}!`, 'info');

        //Clear fields        
        UI.clearFields();
    }
}) 

document.querySelector('#new-player-form').addEventListener('submit', (e) => {
    //Keep open
    e.preventDefault();

    //Hide form
    const x = document.getElementById("new-player-form");
    x.style.display = "none";

    //Add new player
    const playerName = document.querySelector("#player-name").value;
    if (!validatePlayerName(playerName)) {
        UI.showAlert('Invalid Input', 'danger');
    } else {
        Store.addPlayer(playerName);
        UI.addPlayertoList(playerName);
        UI.showAlert(`New Player Added: ${playerName}`, 'info');
    }
})


/********************************************************************************************************** */
//Functions
/********************************************************************************************************** */

//TODO check existing names
function validatePlayerName(playerName){
    if (playerName == null || playerName == '') {
        return false;
    }
    for (let i=0; i<playerList.length; i++) {
        if (playerList[i] == playerName) {
            return false;
        }
    }
    return true;
}

function sortTeams() {
    teamList.sort((a, b) => (a.elo < b.elo) ? 1 : -1);
}

//Adds new team if it doesn't exist
function addNewTeam(teamName) {
    if (!findTeam(teamName)) {
        teamList.push(new Team(teamName));
    }
}

//Check if team exists by name
function findTeam(teamName){
    for (var i=0; i < teamList.length; i++) {
        if (teamList[i].name === teamName) {
            return true;
        }
    }
    return false;
}

//Return team object
function getTeam(teamName){
    for (var i=0; i < teamList.length; i++) {
        if (teamList[i].name === teamName) {
            return teamList[i];
        }
    }
}

//Take in players and return team name based on alphabetical order
function getTeamName(player1, player2) {
    if (player1 <= player2) {
        var teamName = `${player1} and ${player2}`;
    } else {
        var teamName = `${player2} and ${player1}`;
    }
    return teamName;
}

//Check that input is valid
function validateGame(player1, player2, player3, player4) {
    if(
        player1 == '' || player2 == '' || player3 == '' || player4 == '' ||
        player1 == player2 || player2 == player3 || player3 == player4 || 
        player1 == player3 || player1 == player4 || player2 == player3 || player2 == player4
        ) {
        return false;
    } 
    return true;
}

//Calulates new team elos
function calculateElo(team1Name, team2Name) {
    team1 = getTeam(team1Name);
    team2 = getTeam(team2Name);
    const probability1 = (1.0 / (1.0 + Math.pow(10, ((team2.elo-team1.elo)/400))));
    const probability2 = (1.0 / (1.0 + Math.pow(10, ((team1.elo-team2.elo)/400))));
    team1.elo = team1.elo + (K * (1 - probability1));
    team2.elo = team2.elo + (K * (0 - probability2));
    team1.gamesWon++;
    team2.gamesLost++;
}

//Shows player input
function showbutton() {
    const x = document.getElementById("new-player-form");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
  }
}