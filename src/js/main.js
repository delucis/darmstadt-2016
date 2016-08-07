var d3 = require('d3');

d3.json('merged-data.json', function (error, json) {
  render(json);
});

function render(mergedData) {
  var proportions = getAllOverallProportions(mergedData);
  var vizbox = d3.select("#vizbox");

  vizbox
    .select("#placeholder")
    .remove();

  vizbox
    .append("ul")
    .attr("class", "overview")
    .selectAll("li")
    .data(d3.keys(proportions))
    .enter()
    .append("li")
    .html(function (d) {
      var p = proportions[d];
      var header = '<h3>' + d + '</h3>';
      var stats = proportionBar(p);
      return header+stats;
    });

  vizbox
    .select(".overview")
    .insert("li", ":first-child")
    .append("h1")
    .text("concerts");

  vizbox
    .append("ul")
    .attr("class", "details")
    .selectAll("li")
    .data(mergedData.concerts)
    .enter()
    .append("li")
    .html(function(d) {
      var perfProp = getPerformerProportion(d, mergedData.people);
      var compProp = getComposerProportion(d, mergedData.people);
      var title = '<h4><a href="' + d.meta.url + '">' + d.name + '</a></h4>';
      var perfPropString = '', compPropString = '';
      if (perfProp !== undefined) {
        perfPropString = "<h6>Performers</h6>" + proportionBar(perfProp);
      }
      if (compProp !== undefined) {
        compPropString = "<h6>Composers</h6>" + proportionBar(compProp);
      }
      return title + perfPropString + compPropString;
    });
}

function formatProportion(prop, wrapper) {
  var el = wrapper ? wrapper : 'span';
  if (prop.hasOwnProperty('m') && prop.hasOwnProperty('f')) {
    return '<' + el + ' class="proportion">♂ ' + prop.m + ' - ' + prop.f + ' ♀</' + el + '>';
  } else {
    return undefined;
  }
}

function proportionBar(props) {
  var sum = 0;
  for (var i in props) {
    if (props.hasOwnProperty(i) && typeof props[i] === 'number') {
      sum += props[i];
    }
  }

  var html = '<div class="proportion-bar">';
  for (var prop in props) {
    if (props.hasOwnProperty(prop) && props[prop] > 0) {
      var tooltip = '';
      switch (prop) {
        case "m":
          tooltip = 'Male';
          break;
        case "f":
          tooltip = 'Female';
          break;
        case "o":
          tooltip = 'Non-binary';
          break;
        default:
          tooltip = 'Unknown';
          break;
        }
        var percentage = props[prop]/sum*100;
        tooltip += ': ' + percentage.toFixed(1) + '%';
      html += '<span class="hint--bottom ' + prop + '" style="width:' + percentage + '%;" aria-label="' + tooltip + '">' + props[prop] + '</span>';
    }
  }
  html += '</div>'
  return html;
}

function getAllOverallProportions(data) {
  var proportions = new Object();
  // proportions.total = getOverallProportion(data);
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
    var proportion = { m: 0, f: 0, o: 0, u: 0 }
    for (var i = 0; i < programme.length; i++) {
      if (programme[i].hasOwnProperty('composer')) {
        var composers = new Array();
        var composerField = programme[i].composer;
        if (typeof composerField === 'object' && Array.isArray(composerField)) {
          composers = composerField;
        } else if (typeof composerField === 'string') {
          composers.push(composerField);
        } else {
          break
        }
        for (var j = 0; j < composers.length; j++) {
          var composer = composers[j]
          if (people[composer].hasOwnProperty('gender')) {
            switch (people[composer].gender) {
              case "MALE":
                proportion.m += 1;
                break;
              case "FEMALE":
                proportion.f += 1;
                break;
              case "OTHER":
              default:
                proportion.o += 1;
                break;
            }
          } else {
            proportion.u += 1;
          }
        }
      }
    }
    return proportion;
  }
}

function getPerformerProportion(concert, people) {
  if (!concert.performers) {
    return undefined;
  } else {
    var performers = concert.performers;
    var proportion = { m: 0, f: 0, o: 0, u: 0 }
    for (var p in performers) {
      var performer = performers[p];
      if (typeof performer === 'number') {
        proportion[p] = performer;
      } else if (people[performer].hasOwnProperty('gender')) {
        switch (people[performer].gender) {
          case "MALE":
            proportion.m += 1;
            break;
          case "FEMALE":
            proportion.f += 1;
            break;
          case "OTHER":
          default:
            proportion.o += 1;
            break;
        }
      } else {
        proportion.u += 1;
      }
    }
    return proportion;
  }
}
