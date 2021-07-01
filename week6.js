
// Add common header - just to be fancy.
document.addEventListener('DOMContentLoaded', ()=>{
  // add H1 using content form doc title
  var header1 = document.createElement("H1");
  header1.textContent = document.title ? document.title : "Update document title";
  document.body.prepend(header1);
 
  // Cry havoc, and let loose the dogs of ...
  window.W = new WAR();
  document.getElementById("btnPlay").addEventListener('click',() => W.play() );
} );

/* --------------------------------------------
For the final project you will be creating an automated version of the classic card game WAR.
The completed project should, when ran, do the following:
-	Deal 26 Cards to two Players from a Deck. 
-	Iterate through the turns where each Player plays a Card
-	The Player who played the higher card is awarded a point
    o	Ties result in zero points for either Player
-	After all cards have been played, display the score.

2 Players

1 deck
- build, shuffle

Game rules
- deal cards
- players play card as dealt.
- play each trick - 
    1 point to higher card - no points to tie.
- Display score at end of game.

------------------------------------------------- */
// handy toys to share
class Utils {
    constructor(){
        this.targetElem = document.getElementById("msg");
        this.tmpElem = null;
    }

    out(strIn,cFormat){
        if(arguments[1] === undefined) {
            cFormat = "c"; 
        }
        if(cFormat !== "c") strIn = strIn.replace(/\n/g, "<br>");
        switch (cFormat){
            case "c":  // console
                // console.log(this.cards[i].join("|"))
                console.log( strIn );
                break;
            case "p":
                this.tmpElem = document.createElement('P');
                this.tmpElem.innerHTML = strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            case "pb":
                this.tmpElem = document.createElement('P');
                this.tmpElem.classList.add("bold");
                this.tmpElem.innerHTML = strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            case "pl":
                this.tmpElem = document.createElement('P');
                this.tmpElem.classList.add("list");
                this.tmpElem.innerHTML = "- " + strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            case "h2":
                this.tmpElem = document.createElement('H2');
                this.tmpElem.textContent = strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            case "h3":
                this.tmpElem = document.createElement('H3');
                this.tmpElem.textContent = strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            case "g":
                this.tmpElem = document.createElement('P');
                this.tmpElem.classList.add("grumble");
                this.tmpElem.innerHTML = strIn;
                this.targetElem.append(this.tmpElem);
                this.tmpElem = null;
                break;
            default:
                let msg = `Yo, Genius - specify an output destination.
                Options are:
                'c' for console
                'p' - paragraph elem
                'g' - paragraph elem, class = grumble
                'h2' - h2 elem
                'h3' - h3 elem`;
                console.log(msg);
        }

    }
}

class Deck extends Utils {
    constructor(){
        /* cards - a 2D array.  Primary array is a card
        Each card is a subarray where [0] is suit, [1] is value
        Sample: [
            [H,1], 
            [H,1], 
            [H,1], 
            ... etc ... 
        ]
        */
        super();
        this.cards = [];
        
        // object for quick lookup of values to rewrite.  Much faster than ifs or case.
        this.displayVals = {
            "H":"Hearts",
            "D":"Diamonds",
            "S":"Spades",
            "C":"Clubs",
            "1":"Ace",
            "11":"Jack",
            "12":"Queen",
            "13":"King"
        } 

        // Do the initial load and shuffle as part of creating the deck
        this.load();
        this.shuffle();
    }

    // A method to get a nice display value for a given card.
    getDisplayCard(arrIn){
        let strValue = this.displayVals[ arrIn[1] ] === undefined ? arrIn[1] : this.displayVals[ arrIn[1] ];
        let strSuit = this.displayVals[arrIn[0]];
        return `${strValue} of ${strSuit}`;

    }
    // write the entire deck to an output specified
    write(charOutput){
        if(arguments[0] === undefined) {
            charOutput = "c"; 
        }
        for(let i=0; i<this.cards.length; i++) {
            super.out( this.getDisplayCard(this.cards[i]), charOutput );
        }
    }

    load(){
        let suits = ["H","D","S","C"];
        let vals = {"11":"J", "12":"Q", "13":"K"}
        // clear our last game
        this.cards = [];
        // populate deck by suit for a freshly-unwrapped deck.
        for(let s=0; s<suits.length; s++){
            //generate the suite, push to cards array
            for(let i=1; i<=13; i++){
                this.cards.push( [suits[s],i] );
            }

        }
    }
    /* ---------------------------
    shuffle: from https://www.frankmitchell.org/2015/01/fisher-yates/
    Notes:  That’s a Fisher-Yates shuffle. It was invented by Ronald Fisher and Frank Yates in 1938, 
    originally as a method for researchers to mix stuff up with pencil and paper. In 1964, Richard Durstenfeld 
    came up with the modern method as a computer algorithm. It has a run time complexity of O(n).
    ------------------------------ */
    shuffle(){
        let i = 0, j = 0, temp = null;
    
        for (let i = this.cards.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
            }
    }
}

class Player extends Utils {
    constructor(name, isDealer){
        super(); 

        if (arguments[0] === undefined || arguments[0] === null || (!isNaN(arguments[0])) ) {
            console.log ("Player: Param 1 (String) required cannot be undefined, null or numeric.  Try again, genius");
            return; 
        }
        if (arguments[1] === undefined || arguments[1] === null ) {
            isDealer = false; 
        }

        this.name = name;
        this.hand = [];
        this.isDealer = isDealer;
        this.wonLastHand = false;
        this.Deck = null;
        this.points = 0;
    }
    reset(){
        this.hand = [];
        this.Deck = null;
        this.points = 0;
    }

    deal(arrPlayers){
        let playIdx = 0; 
        let thisCard;
        // discard extra cards - burn 'em
        let numCardsBurned = this.Deck.cards.length % arrPlayers.length;

        while(this.Deck.cards.length > numCardsBurned ) {
            thisCard = this.Deck.cards.shift();
            arrPlayers[playIdx].hand.unshift(thisCard);
            playIdx ++;
            if (playIdx === arrPlayers.length) playIdx = 0;
        }
    
    }
    brag(handNumIn){
        let strTmp = `${this.name}: I won hand number ${handNumIn}!`;
        super.out(strTmp);
        super.out(strTmp, "pb");
    }
    declareTie(handNumIn){
        let strTmp = `${this.name}: Hand ${handNumIn} tied ... no winner.`;
        super.out(strTmp);
        super.out(strTmp, "pb");

    }
    grumble(handNumIn){
        let grumbles = ["Awww ...","C'mon!","Seriously?!?", "You gotta be kidding me.", "Just deal the cards ...", "Fer Pete's sake."];
        let random = Math.floor(Math.random() * grumbles.length);
        let strTmp = this.name + ": " + grumbles[random];
        super.out(strTmp);
        super.out(strTmp, "g");
    }
}

class WAR extends Utils{
    constructor(){
        super();
        // unwrap the deck and shuffle
        this.Deck = new Deck();
        // create the discard pile for all played hands. 
        this.Hands = [];
        // create the players - set who deals first 
        // this.Players = [ new Player("Pebbles"), new Player("Wilma"), new Player("Betty"), new Player("Fred",true), new Player("Barney") ]; 
        this.Players = [];
    }

    // The main method - all the magic happens here.
    play(){
        // make a message string for reuse
        let strTmp = "";
        // reset the message area
        this.targetElem.textContent = "";

        // Figure out who's playing
        let playerNames = "";
        let playerElems = document.querySelectorAll("#ctls input[type='checkbox']");

        // figure out exactly who is playing by looking at form checkboxes.
        // Reset current players, add new players, remove non-players.
         var p;
    for (var i=0;i<playerElems.length; i++){
            // reset loop switches
            let playerExists = false;
  
            // do we have a Player in Players for the selected checkbox
            for (p=0; p<this.Players.length; p++){
                if (this.Players[p].name === playerElems[i].value){
                    playerExists = true;
                    break;
                }
            }
            // if checkbox is checked, check if Player exists.  If not, create.  If so, reset
            if(playerElems[i].checked === true) {
                if(playerExists) {
                    this.Players[p].reset();
                } else {
                    this.Players.push( new Player( playerElems[i].value ) ); 
                }
            } else {
                // if present but not checked, remove
                if(playerExists) {
                    this.Players.splice(p,1); 
                }
             }
        }

        // Of the invitees, see who showed up - if not enough players, message and bail out
        if(this.Players.length === 0 ){
            strTmp=`Say Einstein ...\nIt's hard to play cards when there's nobody at the table.\nCheck some boxes and try again.`;
        }
        if(this.Players.length === 1 ){
            strTmp=`Yo, Einstein!\nDoes it say Solitare anywhere on this page?\nCheck <b>more than one box</b> and try again.`;
        }

        if (strTmp.length > 0) {
            super.out(strTmp,"c");
            super.out(strTmp,"p");
            strTmp="";
            return;
        }


        // Who deals?
        // check for previous winners - whoever won last deals.
        let gottaDealer = false;
        for (p=0; p<this.Players.length; p++){
            if(this.Players[p].wonLastHand) {
                this.Players[p].wonLastHand=false;
                this.Players[p].isDealer=true;
                gottaDealer = true;
            } else {
                this.Players[p].wonLastHand=false;
                this.Players[p].isDealer=false;
            }
        }
        // Otherwise first player created deals.
        if(gottaDealer === false) this.Players[0].isDealer= true;

        // We got players?  We gotta dealer?  Let's play!
        // reset from last game
        this.Deck.load();
        this.Deck.shuffle();

        // Instead of moving the deck, move the players until the dealer is last.
        // Then the last card in each round properly goes to the dealer.
        while(!this.Players[ this.Players.length-1 ].isDealer){
            let pTemp = this.Players.shift();
            this.Players.push(pTemp);
        }
        // find the dealer, give him the deck.  
        // Architecturally gratutious, I know ... but the Dealer's gotta deal, or he's just a player.
        let theDealer = this.Players[this.Players.length-1];
        theDealer.Deck = this.Deck;
        theDealer.Deck.shuffle();

        //clear out the discard pile - doesn't get used, but left to support future features.
        this.Hands.length = 0;

        // clear message string for reuse
        strTmp = "";

        // heading
        strTmp=`Start the game`;
        super.out(strTmp,"c");
        super.out(strTmp,"h2");

        // Make him deal the cards
        theDealer.deal(this.Players);

        strTmp=`${theDealer.name} has dealt ${theDealer.hand.length} cards to each player.\nThere are ${theDealer.Deck.cards.length} cards in the hole.`;
        super.out(strTmp,"c");
        super.out(strTmp,"p");
        
        // play each hand in turn.
        let thisHand, numHands = 0; 
        let WinningPlayer = null, winningValue = 0, isTie = false; 
        while(theDealer.hand.length > 0 ){
            // empty the hand out
            thisHand=[];
            // increment the counter
            numHands++;
            // clear out prevous values 
            winningValue = 0; 
            WinningPlayer = null;

            // subhead
            super.out("Hand " + numHands,"h3");

            // Play the cards, figure out who won
            let p;
            for (p=0; p<this.Players.length; p++) {
                if(this.Players[p].hand[0][1] > winningValue) {
                    winningValue = this.Players[p].hand[0][1]; 
                    WinningPlayer = this.Players[p];
                } else if (this.Players[p].hand[0][1] === winningValue) {
                    WinningPlayer = null;
                }
                super.out(`${this.Players[p].name} plays a ${this.Deck.getDisplayCard(this.Players[p].hand[0])}`, "pl");
                
                thisHand.push(this.Players[p].hand.shift());
                // Add player's name to hand
                thisHand[thisHand.length-1].push(this.Players[p].name);                
            }
            // reset to go round again
            if (p === this.Players.length) p=0;

            // Glory or grumbles.
            if (WinningPlayer !== null) {
                WinningPlayer.points++;
                WinningPlayer.brag(numHands, winningValue);
            } else {
                theDealer.declareTie(numHands);
                for (let p=0; p<this.Players.length; p++){
                    if(this.Players[p].isDealer === false) this.Players[p].grumble();
                }
            }
            // console.log(numHands +": " + thisHand.join(" | "));
            
            // put the hand on the discard pile
            this.Hands.unshift(thisHand);
        }

        // find who won, mark as winner and set to next dealer.
        // Sort players by pont total
        this.Players.sort(function(ObjA, ObjB){
            return ObjB.points - ObjA.points;
        });

        super.out("And the Winner is ... ","h2");

        let winningVal = this.Players[0].points;
        let winnerCount = 0;
        this.Players.forEach( function(Player, idx) {
            strTmp = `${Player.name} has ${Player.points} points`;
            if(Player.points == winningVal) {
                strTmp += " -- WINNER!";
                winnerCount++;
                // winner deals next round.  
                if(winnerCount === 1) {
                    Player.wonLastHand = true;
                } else {
                    Player.wonLastHand = false;
                }
            } else {
                Player.wonLastHand = false;
            }
            Player.out(strTmp,"pl");
        }); 


    }

}


/* --------------------------------------------
Write a Unit Test using Mocha and Chai for at least one of the functions you write.
------------------------------------------------- */
