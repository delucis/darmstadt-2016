var d3 = require('d3');

d3.json('merged-data.json', function (error, json) {
  render(json);
});

function render(mergedData) {
  var proportions = getAllOverallProportions(mergedData);

  d3.select("#vizbox")
    .append("ul")
    .attr("class", "overview")
    .selectAll("li")
    .data(d3.keys(proportions))
    .enter()
    .append("li")
    .html(function (d) {
      var p = proportions[d];
      var header = '<h3>' + d + '</h3>';
      var stats = '<p>♂ ' + p.m + ' - ' + p.f + ' ♀</p>';
      return header+stats;
    });

  d3.select("#vizbox")
    .append("ul")
    .attr("class", "details")
    .selectAll("li")
    .data(mergedData.concerts)
    .enter()
    .append("li")
    .html(function(d) {
      var perfProp = getPerformerProportion(d, mergedData.people);
      var compProp = getComposerProportion(d, mergedData.people);
      var title = '<a href="' + d.meta.url + '">' + d.name + '</a>';
      var perfPropString = '', compPropString = '';
      if (perfProp !== undefined) {
        perfPropString = "<br>Performers: ♂ " + perfProp.m + " - " + perfProp.f + " ♀";
      }
      if (compProp !== undefined) {
        compPropString = "<br>Composers: ♂ " + compProp.m + " - " + compProp.f + " ♀";
      }
      return title + perfPropString + compPropString;
    });
}

function formatProportion(prop, wrapper) {
  var el = wrapper ? wrapper : 'span';
  console.log(el);
  if (prop.hasOwnProperty('m') && prop.hasOwnProperty('f')) {
    return '<' + el + ' class="proportion">♂ ' + prop.m + ' - ' + prop.f + ' ♀</' + el + '>';
  } else {
    return undefined;
  }
}

function getAllOverallProportions(data) {
  var proportions = new Object();
  proportions.overall = getOverallProportion(data);
  proportions.composers = getOverallComposerProportion(data);
  proportions.performers = getOverallPerformerProportion(data);
  return proportions;
}

function getOverallProportion(data) {
  var proportions = [];
  for (var i = 0; i < data.concerts.length; i++) {
    var proportion = getProportion(data.concerts[i], data.people);
    if (proportion) {
      proportions.push(proportion);
    }
  }
  var overallProportion = sumProportions(proportions);
  return overallProportion;
}

function getOverallComposerProportion(data) {
  var proportions = [];
  for (var i = 0; i < data.concerts.length; i++) {
    var proportion = getComposerProportion(data.concerts[i], data.people);
    if (proportion) {
      proportions.push(proportion);
    }
  }
  var overallProportion = sumProportions(proportions);
  return overallProportion;
}

function getOverallPerformerProportion(data) {
  var proportions = [];
  for (var i = 0; i < data.concerts.length; i++) {
    var proportion = getPerformerProportion(data.concerts[i], data.people);
    if (proportion) {
      proportions.push(proportion);
    }
  }
  var overallProportion = sumProportions(proportions);
  return overallProportion;
}

function getProportion(concert, people) {
  var proportion;
  var performers = getPerformerProportion(concert, people);
  var composers = getComposerProportion(concert, people);
  if (composers && !performers) {
    proportion = composers;
  } else if (performers && !composers) {
    proportion = performers;
  } else if (performers && composers) {
    proportions = [];
    proportions.push(performers);
    proportions.push(composers);
    proportion = sumProportions(proportions);
  }
  return proportion;
}

function sumProportions(proportions) {
  if (typeof proportions === 'object' && Array.isArray(proportions)) {
    var sum = { m: 0, f: 0, o: 0, u: 0 };
    for (var i = 0; i < proportions.length; i++) {
      Object.keys(proportions[i]).forEach(function(key){
        sum[key] += proportions[i][key];
      });
    }
    return sum;
  }
}

function getComposerProportion(concert, people) {
  if (!concert.programme) {
    return undefined;
  } else {
    var programme = concert.programme;
    var m = 0, f = 0, o = 0, u = 0;
    for (var i = 0; i < programme.length; i++) {
      if (programme[i].hasOwnProperty('composer')) {
        var composer = programme[i].composer;
        if (people[composer].hasOwnProperty('gender')) {
          switch (people[composer].gender) {
            case "MALE":
              m += 1;
              break;
            case "FEMALE":
              f += 1;
              break;
            default:
              o += 1;
              break;
          }
        } else {
          u += 1;
        }
      }
    }
    var proportion = { m: m, f: f, o: o, u: u }
    return proportion;
  }
}

function getPerformerProportion(concert, people) {
  if (!concert.performers) {
    return undefined;
  } else {
    var performers = concert.performers;
    var m = 0, f = 0, o = 0, u = 0;
    for (var p in performers) {
      var performer = performers[p];
      if (people[performer].hasOwnProperty('gender')) {
        switch (people[performer].gender) {
          case "MALE":
            m += 1;
            break;
          case "FEMALE":
            f += 1;
            break;
          default:
            o += 1;
            break;
        }
      } else {
        u += 1;
      }
    }
    var proportion = { m: m, f: f, o: o, u: u }
    return proportion;
  }
}
