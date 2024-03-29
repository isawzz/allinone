const makeSVG = function(tag, attrs) {
  var el= "<" + tag;
  for (var k in attrs)
    el += " " + k + "=\"" + attrs[k] + "\"";
  return el + "/>";
}
const shuffleArray = arr => arr.sort(() => Math.random() - 0.5)
let deck = [];
var cardsAdded = false;
var currentSET;
var hintCounter = 0;
var logCounter = 0;

function makeDeck() {
  // Fill the deck with cards
  deck.splice(0);//empty deck
  [1, 2, 3].forEach(function(number){
    ['red','purple', 'green'].forEach(function(color){
      ['diamond', 'squiggle', 'oval'].forEach(function(shape){
        ['solid', 'striped', 'open'].forEach(function(fill){
          deck.push({
            number: number,
            shape: shape,
            color: color,
            fill: fill
          });
        });
      });
    });
  });
}

const paths = {
  diamond: {
    d: "M25 0 L50 50 L25 100 L0 50 Z"
  },
  squiggle: {
    d: "M38.4,63.4c0,16.1,11,19.9,10.6,28.3c-0.5,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z"
  },
  oval: {
    d: "M25,99.5C14.2,99.5,5.5,90.8,5.5,80V20C5.5,9.2,14.2,0.5,25,0.5S44.5,9.2,44.5,20v60 C44.5,90.8,35.8,99.5,25,99.5z"
  }
}
const colors = {
  red: '#e74c3c',
  green: '#27ae60',
  purple: '#8e44ad'
};

// Display a card based on card object
function drawCard(card){
  let shapes = '';
  var attr = paths[card.shape];
  if(card.fill=="striped"){
    attr.fill = 'url(#striped-'+card.color+')';
  } else if(card.fill=="open"){
    attr.fill = 'none';
  } else if(card.fill=="solid"){
    attr.fill = colors[card.color];
  }
  for(var i=0;i<card.number;i++){
    shapes += '<svg viewbox="-2 -2 54 104">' + makeSVG("path", attr) + '</svg>';
  }
  var $card = $("<div />", {
    class: 'card fill-'+card.color,
    html: '<div class="card-content">' + shapes + '</div>'
  }).data("color", card.color)
    .data("shape", card.shape)
    .data("number", card.number)
    .data("fill", card.fill);
  return $card;
}

var selects = [];//Array of selected cards

// Handle click events on cards
$('.board').on('click','.card', function(){
  
  if(!$(this).hasClass("selected")){
    selects.push($(this));
    $(this).addClass("selected");
    if(selects.length>=3){
      var isValid = checkIfSET(selects);
      setTimeout(function(){//Wait half a second before proceeding
        if(isValid){
          //Message correct!
          replaceCards(selects);
          resetVars();
        } else {
          //Message error!
        }
        addLogEntry(selects,isValid);
        $('.card').removeClass("selected");
        selects.splice(0);
      },500);
    }
  } else if(selects.length<3) {
    selects.splice(selects.indexOf($(this)),1);
    $(this).removeClass("selected");
  }
});

function getNextCard(){
  var card = deck[0];
  deck.splice(0,1);
  return card;
}

function replaceCards(cards){
  
  for(var i in cards){
    if(!cardsAdded){
      cards[i].replaceWith(drawCard(getNextCard()));
    } else {
      cards[i].remove();
    }
  }
  cardsAdded = false;
  animateCards(200);
  
}

function checkIfSET(cards){
  var SET = true;
  var data = {
    number: [],
    color: [],
    fill: [],
    shape: [],
  };
  for(var i = 0; i<cards.length;i++){
    for(var cardData in cards[i].data()){
      data[cardData].push(cards[i].data(cardData));
    }
  }
  for(var array in data){
    if(!checkIfSameOrDifferent(data[array])){
      SET = false;
    }
  }
  return SET;
}

function checkIfSameOrDifferent(array){
//   Not the best way but this will do for now...
  var same = true, different = true;
  if(array[0]===array[1]){
    different = false;
  } else {
    same = false;
  }
  if(array[1]===array[2]){
    different = false;
  } else {
    same = false;
  }
  if(array[0]===array[2]){
    different = false;
  } else {
    same = false;
  }
  
  return same||different;
}

function add3Cards(){
  for(var i=0;i<3;i++){
    $('.board').append(drawCard(getNextCard()));
  }
  $('#add').attr("disabled", "disabled").removeClass('highlight');
  
  cardsAdded = true;
  animateCards(100);
}

function findSETs(){
  let counter = 0;
  let SETsFound = [];
  var cards = $('.board .card');
  for(var x = 0; x < cards.length; x++){
    for(var y = 1; y < cards.length; y++){
      for(var z = 2; z < cards.length; z++){
        if(cards[x]!==cards[y]&&
        checkIfSET([cards.eq(x),cards.eq(y),cards.eq(z)])){
          SETsFound.push([cards.eq(x),cards.eq(y),cards.eq(z)]);
        }
      }
    }
  }
  return SETsFound;
}

function hint(){
  var SETs = findSETs();
  if(SETs.length>0){
    //find the next card from a random set and highlight it
    var currentSET = currentSET||SETs[Math.floor(Math.random())*SETs.length];
    $(currentSET[hintCounter]).addClass("highlight");
    hintCounter++;
  } else {
    $("#add").addClass("highlight");
  }
}

function resetVars(){
  $("#add").removeClass("highlight");
  $('#add').removeAttr("disabled");
  hintCounter = 0;
}

function setBoard(){
  $('.board').html("");//reset the board
  $('.log').html('');
  selects = [];
  makeDeck();
  cards = shuffleArray(deck);
  for(var i=0;i<12;i++){
    $('.board').append(drawCard(getNextCard()));
  }
  animateCards(100);
}

function addLogEntry(set, valid){
  var entryClass = logCounter%2?"":"odd";
  var entry = '<span class="validate '+ (valid?'valid':'invalid') + '">'+ 
      (valid?"✓":"✗") + 
      '</span><div class="set">';
  for(var i = 0; i<set.length; i++)
    entry += set[i].removeClass('highlight')[0].outerHTML;
  entry += "</div>";
  entry += valid ? "SET matched!" : "Invalid SET!";
  $('<div />', {
    class: 'entry ' + entryClass,
    html: entry
  }).prependTo('.log');
  logCounter ++;
}

function animateCards(delay){
  $('.card:not(.fadeIn)').each(function(i){
    var card = $(this);
    setTimeout(function(){
      card.addClass('fadeIn');
    },delay*i);
  });
}

setBoard();//Kick things off

// Set height of sidebar
$(window).resize(function(){
  if($(window).width() > 650){
    $('.sidebar').css({height: $('.board').outerHeight()});
  } else {
    $('.sidebar').removeAttr('style');
  }
});
$(window).resize();