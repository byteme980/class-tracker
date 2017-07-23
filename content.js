/*
 * When on the this file gets executed only on the ClassPass past page
 * it extracts the studio name and date/time visited and the date of the month's cycle
 * and inserts a mapping of studio names to number of visits into the page's DOM
 */

// given a date string in the format "Sat 7/22" return a timestamp in MS
function convertMMDDToMS(dateString){
  var monthDayArr = dateString.split('/');
  var month = monthDayArr[0];
  var day = monthDayArr[1];

  // zero-pad the day/month
  month = month.length === 1 ? '0' + month : month;
  day = day.length === 1 ? '0' + day : day;

  // js is funky, in that in numbers years in the 1900s 0-99, the 2000s 100 -199, etc.
  var year = "20" + (new Date().getYear() - 100);
  return new Date(year + '-' +  month + '-' + day).getTime();
}

// grab all the studio names that were visited
var studios = $.map($('.media__body p .link--stealth'), function(htmlTag) {
  return htmlTag.text;
});

// create an array of timestamps, which correspond to the times of ClassPass studio visits
var visitTimes = $.map($('.media__body p:nth-of-type(2)'), function(htmlTag){
  // dateStr is in the format DAY M/D, e.g. Wed 6/8
  var dateStr =  htmlTag.innerText.split('\n')[0].split(' ')[1];
  return convertMMDDToMS(dateStr);
});

// using the studio names and timestamps, create an array consolidating studio name and visit timestamp
var studioVisits = [];
studios.forEach(function(studio, i) {
  studioVisits[i] = {
    studio: studio,
    date: visitTimes[i]
  }
});

// grab the first day of the next billing cycle
var nextCycleText = $('.sidebar__next-cycle').text().split(' ')[3];
var nextCycle = convertMMDDToMS(nextCycleText);

var MS_PER_DAY = 1000 * 60 * 60 * 24;
var MS_PER_CYCLE = MS_PER_DAY * 30;

// the end of the current billing cycle is one day before the start of the next
var cycleEnd = nextCycle - MS_PER_DAY;
var cycleBeginning = cycleEnd - MS_PER_CYCLE;


// for the current month's cycle, create a mapping between studio names and the number of visits per studio
var currentCycleVisits = {};
studioVisits.forEach(function(visit, i) {
  var date = visit.date, studio = visit.studio;
  // make sure the date is between cycleBeginning and cyleEnd
  if (date <= cycleEnd &&  date >= cycleBeginning ) {
    currentCycleVisits[studio] ? currentCycleVisits[studio]++ : currentCycleVisits[studio] = 1;
  }
});

// create an unordered list of the number of visits per studio and inject into the DOM
var pastClassStr = '<div><h2>Class Tally</h2><ul>'
Object.keys(currentCycleVisits).forEach(function(studio) {
  pastClassStr += ( '<li><strong>' + studio + '</strong>: ' + currentCycleVisits[studio] + '\n' + '</li>') ;
});
pastClassStr + '</ul></div>'

$(pastClassStr).prependTo($('.profile'));
