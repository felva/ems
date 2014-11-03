"use strict";

var page = new (function () {

  var baseUrl = 'http://emspost.ru/api/rest/';

  var $wrapper,
      $form,
      $formLoader,
      $selectFrom,
      $selectTo,
      $inputWeight;

  function locationAsOption(emsLocation) {
    return $('<option/>').attr('value', emsLocation.value).text(emsLocation.name);
  }

  /**
   * Loads locations and maximal weight into form using JSONP requests.
   */
  function loadValues() {
    var $locationsLoaded = $.getJSON(baseUrl + '?callback=?', {
      method: 'ems.get.locations',
      type: 'cities',
      plain: 'true'
    }).done(function (data) {
      $.each(data.rsp.locations, function (i, e) {
        $selectFrom.append(locationAsOption(e));
        $selectTo.append(locationAsOption(e));
      });
    });

    var $maxWeightLoaded = $.getJSON(baseUrl + '?callback=?', {
      method: 'ems.get.max.weight'
    }).done(function (data) {
      var maxWeight = parseFloat(data.rsp.max_weight);
      $inputWeight.attr('min', 0.1).attr('max', maxWeight).attr('step', 0.1).attr('value', 0.1);
    });

    $.when($locationsLoaded, $maxWeightLoaded).done(function () {
      // Update weight output.
      $inputWeight.trigger('change');

      $.when(calculate(true)).done(function () {
        // Hide placeholder.
        $formLoader.hide();
        $form.fadeIn();
      });
    });

  }

  /**
   * Performs results update based on form inputs.
   * @param noAnim {boolean} If set, no animations for result rows will be issued.
   */
  function calculate(noAnim) {

    // Show placeholder instead of results.
    $wrapper.find('.result').hide();
    if (noAnim) $wrapper.find('tr.loader').show();
    else        $wrapper.find('tr.loader').fadeIn();

    return $.getJSON(baseUrl + '?callback=?', {
      method: 'ems.calculate',
      from: $selectFrom.val(),
      to: $selectTo.val(),
      weight: $inputWeight.val()

    }).done(function (data) {
      var rsp = data.rsp;
      $wrapper.find('#price').text(rsp.price + ' руб.');
      $wrapper.find('#time').text(rsp.term.min + ' - ' + rsp.term.max);

      // Hide placeholder & show results.
      $wrapper.find('tr.loader').hide();
      if (noAnim) $wrapper.find('.result').show();
      else        $wrapper.find('.result').fadeIn();
    });
  }

  /**
   * @param $wrapper0 jQuery object wrapping the related content.
   */
  this.init = function ($wrapper0) {
    $wrapper = $wrapper0;

    $form = $wrapper.find('#form-selector');
    $formLoader = $wrapper.find('.loader-form');

    $selectFrom = $wrapper.find('#select-from');
    $selectTo = $wrapper.find('#select-to');
    $inputWeight = $wrapper.find('#input-weight');

    $inputWeight.on('change', function () {
      $wrapper.find('#input-weight-value').text($inputWeight.val() + ' кг.')
    });

    loadValues();

    $([$selectFrom, $selectTo, $inputWeight]).each(
        function (i, e) {
          e.on('change', function () { calculate() });
        }
    );
  };

});