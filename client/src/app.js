(function(jquery, c3, ko, data, moment, window) {
  'use strict';
  
  var _loadData = function() {
    var numberOfDays = jquery('#timeSelector').val();
    
    var chartData = [];
    var seriesNames = {};
    var seriesGroups = [];
    var minValue = -1;
    var releasedCount = 0;
    var eventData = [];
    
    for (var q = 0; q < data.columns.length; q++) {
      var column = data.columns[q];
      var seriesName = 'series' + (q + 1);
      seriesNames[seriesName] = column + (q === data.columns.length - 1 ? ' (cumulative)' : '');
      seriesGroups.push(seriesName);
    }
    
    for (var indexA = data.data[0].length - 1; indexA > -1; indexA--) {
      var xxy = [ indexA === 0 ? 'date' : 'series' + indexA ];
      
      for (var indexB = 0; indexB < data.data.length; indexB++) {
        var value = data.data[indexB][indexA];
        var ignore = true;
        
        if (numberOfDays) {
          if (moment().subtract(numberOfDays, 'days').isBefore(moment(data.data[indexB][0]))) {
            ignore = false;
          }
        } else {
          ignore = false;
        }
        
        
        if (indexA === data.data[0].length - 1) {
          releasedCount += parseInt(value);
          if (!ignore) {
            if (minValue < 0) {
              minValue = releasedCount;
            }
            
            xxy.push(releasedCount);
          }
          
        } else {
          if (!ignore) {
            xxy.push(value);
          }
          
        }
        
      }
      
      chartData.push(xxy);
    }
    
    for (var eventIndex = 0; eventIndex < data.events.length; eventIndex++) {
      var eventItem = data.events[eventIndex];
      eventData.push({
        value: eventItem[0],
        text: eventItem[1]
      });
    }
    
    return {
      bindto: '#graph',
      data: {
        columns: chartData,
        order: null,
        x: 'date',
        names: seriesNames,
        type: 'area', //'area-spline', 'area', 'area-step'
        groups: [
          seriesGroups
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%d/%m/%Y',
          }
        },
        y: {
          min: minValue,
        }  
      },
      grid: {
        x: {
          lines: eventData
        },
        y: {
          //show: true
        }
      },
      legend: {
        //position: 'inset'
      },
      point: {
        show: false
      },
      size: {
        height: window.innerHeight - 250,
      },
    };
  };
  
  var _renderChart = function() {
    c3.generate(_loadData());
  };
  
  var _populateAddForm = function() {
    var formElement = jquery('#add-form');
    formElement.empty();
    
    formElement.append('<div class="form-group"><label for="date" class="control-label date">Date</label><input class="form-control" id="date" type="text" required="required" value="' + moment().format('DD/MM/YYYY') + '" />');
    
    jquery('#date').datetimepicker({
      format: 'DD/MM/YYYY',
      useStrict: true
    });
    
    for (var index = 0; index < data.columns.length; index++) {
      formElement.append('<div class="form-group"><label for="add-form-' + index + '" class="control-label">' + data.columns[index] + '</label><input class="form-control" id="add-form-' + index + '" type="number" min="0" max="500" step="1" required="required" />');
    }
    
    formElement.append('<div class="form-group"><button type="submit" class="btn btn-primary btn-block"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span><span>&nbsp;Add</span></button>');
  };
  
  var _populateTableColumns = function() {
    var columnsElement = jquery('#table-columns');
    columnsElement.empty();
    
    columnsElement.append('<th>Date</th>');
    
    for (var index = 0; index < data.columns.length; index++) {
      columnsElement.append('<th>' + data.columns[index] + '</th>');
    }
    
    columnsElement.append('<th></th>');
  };
  
  var _populateTableData = function() {
    var columnsElement = jquery('#table-data');
    columnsElement.empty();
    
    for (var index = data.data.length - 1; index > -1; index--) {
      columnsElement.append('<tr>');
      
      var last = jquery('#table-data tr:last');
      
      for (var c = 0; c < data.data[0].length; c++) {
        var dx = data.data[index][c];
        
        if (c === 0) {
          dx = moment(dx).format('DD/MM/YYYY');
        }
        
        last.append('<td>' + dx + '</td>');
      }
      
      last.append('<td><button class="btn btn-danger pull-right" data-delete-index="' + index + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span><span>&nbsp;Delete</span></button></td>');
    }
    
    jquery('[data-delete-index]').click(_deleteRow);
  };
  
  var _deleteRow = function(e) {
    var index = jquery(this).data('deleteIndex');
    
    if (confirm('Are you sure you want to delete this entry?')) {
      data.data.splice(index, 1);
      _save();
      _populateTableData();
    }
  };
  
  var _populateAddEventForm = function() {
    var formElement = jquery('#add-event-form');
    formElement.empty();
    
    formElement.append('<div class="form-group"><label for="event-date" class="control-label date">Date</label><input class="form-control" id="event-date" type="text" required="required" value="' + moment().format('DD/MM/YYYY') + '" />');
    
    jquery('#event-date').datetimepicker({
      format: 'DD/MM/YYYY',
      useStrict: true
    });
    
    formElement.append('<div class="form-group"><label for="add-event-description" class="control-label">Description</label><input class="form-control" id="add-event-description" type="text" required="required" />');
    formElement.append('<div class="form-group"><button type="submit" class="btn btn-primary btn-block"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span><span>&nbsp;Add</span></button>');
  };
  
  
  var _populateEventTableData = function() {
    var columnsElement = jquery('#event-table-data');
    columnsElement.empty();
    
    for (var index = data.events.length - 1; index > -1; index--) {
      columnsElement.append('<tr>');
      
      var last = jquery('#event-table-data tr:last');
      
      last.append('<td>' + moment(data.events[index][0]).format('DD/MM/YYYY') + '</td>');
      last.append('<td>' + data.events[index][1] + '</td>');
      
      last.append('<td><button class="btn btn-danger pull-right" data-delete-event-index="' + index + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span><span>&nbsp;Delete</span></button></td>');
    }
    
    jquery('[data-delete-event-index]').click(_deleteEventRow);
  };
  
  var _deleteEventRow = function(e) {
    var index = jquery(this).data('deleteEventIndex');
    
    if (confirm('Are you sure you want to delete this event?')) {
      data.events.splice(index, 1);
      _save();
      _populateEventTableData();
    }
  };
  
  var _save = function() {
    jquery.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      success: _showSavedAlert,
      contentType: 'application/json',
      dataType: 'json',
      error: _showErrorAlert
    }).always(
      function() {
        jquery('input, .btn').attr('disabled', false);
      }
    );
  };
  
  var _showSavedAlert = function() {
    jquery('.failed-to-save-alert').addClass('hidden');
    jquery('.saved-alert').removeClass('hidden');
    jquery('.saved-alert').removeClass('animated bounceInRight bounceOutRight');
    jquery('.saved-alert').addClass('animated bounceInRight');
    
    window.setTimeout(function() {
      jquery('.saved-alert').addClass('animated bounceOutRight');
    }, 2000);
  };
  
  var _showErrorAlert = function() {
    jquery('.saved-alert').addClass('hidden');
    jquery('.failed-to-save-alert').removeClass('hidden');
    jquery('.failed-to-save-alert').removeClass('animated bounceInRight bounceOutRight');
    jquery('.failed-to-save-alert').addClass('animated bounceInRight');
    
    window.setTimeout(function() {
      jquery('.failed-to-save-alert').addClass('animated bounceOutRight');
    }, 2000);
  };
  
  var _addRow = function(e) {
    e.preventDefault();
    
    jquery('input, .btn').attr('disabled', true);
    
    var inputs = jquery('#add-form input');
    
    var d = [];
    
    for (var index = 0; index < inputs.length; index++) {
      var v = jquery(inputs[index]).val();
      
      if (index === 0) {
        v = moment(v, 'DD/MM/YYYY', true).format('YYYY-MM-DD');
      }
      
      d.push(v);
    }
    
    if (data.isNew) {
      data.data = [d];
      delete data.isNew;
    } else {
      data.data.push(d);
      data.data.sort(_sortData);
    }
    
    _save();
    _populateAddForm();
    _populateTableData();
  };
  
  var _addEvent = function(e) {
    e.preventDefault();
    
    jquery('input, .btn').attr('disabled', true);
    
    
    var eventDate = jquery('#event-date');
    var eventDescription = jquery('#add-event-description');
    
    data.events.push([
      moment(eventDate.val(), 'DD/MM/YYYY', true).format('YYYY-MM-DD'),
      eventDescription.val()
    ]);
    
    data.events.sort(_sortData);
    
    _save();
    
    eventDate.val(moment().format('DD/MM/YYYY'));
    eventDescription.val(null);
    
    _populateEventTableData();
  };
  
  var _sortData = function(a, b) {
    var left = moment(a[0]);
    var right = moment(b[0]);
    
    if (left.isBefore(right)) {
      return -1;
    } else if (left.isAfter(right)) {
      return 1;
    }
    
    return 0;
  };
  
  var _init = function() {
    data.data.sort(_sortData);
    data.events.sort(_sortData);
    
    _renderChart();
    
    jquery('#timeSelector').change(_renderChart);
    jquery('#add-form').submit(_addRow);
    jquery('#add-event-form').submit(_addEvent);
    
    jquery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      switch (jquery(e.target).attr('href')) {
        case '#graph-tab':
          _renderChart();
          break;
        
        case '#data-tab':
          _populateAddForm();
          _populateTableColumns();
          _populateTableData();
          break;
        
        case '#events-tab':
          _populateAddEventForm();
          _populateEventTableData();
          break;
      }
    });
  };
  
  jquery(_init);
})($, c3, ko, data, moment, window);