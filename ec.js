jQuery.noConflict();

var daysForward = 7;

var icalToday = new ICAL.Time.now();

var jcalTimezoneComp = null;
var jcalTzId = null;
var icalTimeZone = null;

function addZero(_int) {
    parseInt(_int);
    if (_int < 10) {
        var padded = '0' + _int;
        return padded;
    } else {
        return String(_int)
    }
}

function to12hour(_24hourTime) {
    var ta = _24hourTime.split('');
    var hour = parseInt(ta[0] + ta[1]);
    var min = ta[2] + ta[3];
    var ampm = (hour > 11) ? ' PM' : ' AM';
    if (hour > 12) hour = hour - 12;
	if (hour == 0) hour = 12;
    return hour + ':' + min + ampm;
}

var weekdayNames = {
    '1': 'Sunday',
    '2': 'Monday',
    '3': 'Tuesday',
    '4': 'Wednesday',
    '5': 'Thursday',
    '6': 'Friday',
    '7': 'Saturday'
};
var weekdayNamesShort = {
    '1': 'Sun',
    '2': 'Mon',
    '3': 'Tues',
    '4': 'Wed',
    '5': 'Thurs',
    '6': 'Fri',
    '7': 'Sat'
};
var weekSchedule = {};
var weekScheduleKeys = [];
var workingScheduleKey = null;

var tt = icalToday.clone();
tt.adjust(-1, 0, 0, 0);
for (var i = 0; i < daysForward; i++) {
    tt.adjust(1, 0, 0, 0);
    key = tt.year + '-' + addZero(tt.month) + '-' + addZero(tt.day);
    weekSchedule[key] = {
        'name': weekdayNames[tt.dayOfWeek()],
        'name_short': weekdayNamesShort[tt.dayOfWeek()],
        'events': []
    };
    weekScheduleKeys.push(key);
}

function buildScheduleDisplay() {

    workingSchedule = weekSchedule[workingScheduleKey];
    //workingDayName = workingSchedule.name;
    workingDayName = workingSchedule.name_short;

    scheduleContainer = jQuery('#ec_schedule_list_container');
    scheduleContainer.html('');

    for (var i = 0; i < workingSchedule.events.length; i++) {

        var timeString = to12hour(workingSchedule.events[i]['starttime']) + ' - ' + to12hour(workingSchedule.events[i]['endtime'])

        var li = jQuery('<div class="ec_schedule_li">');
        var liDayTime = jQuery('<div class="ec_li_day_time">');
        liDayTime
            .html('<span class="dname">' + workingDayName + '</span>&nbsp;&nbsp;<span class="h3">' + timeString + '</span>')

        var liSummary = jQuery('<div class="ec_li_summary"><span class="h3">' + workingSchedule.events[i].summary + '</span></div>');

        d = workingSchedule.events[i].description.replace(/^<br>/i, '');

        var liDescr = jQuery('<div class="ec_li_description">');
        liDescr.append('<span>' + d + '</span>')

        li.append(liDayTime).append(liSummary).append(liDescr);
        scheduleContainer.append(li);

    }


    currentPos = weekScheduleKeys.indexOf(workingScheduleKey);
    if (currentPos > 0) {
        prev_key = weekScheduleKeys[currentPos - 1];
        prev_name = weekSchedule[prev_key].name;
        jQuery('#ec_previous_schedule span').text(prev_name);
        jQuery('#ec_previous_schedule, #ec_picker_separator').show();
    } else {
        jQuery('#ec_previous_schedule, #ec_picker_separator').hide();
    }

    if (currentPos == weekScheduleKeys.length - 1) {
        jQuery('#ec_next_schedule, #ec_picker_separator').hide();
    } else {
        next_key = weekScheduleKeys[currentPos + 1];
        next_name = weekSchedule[next_key].name;
        jQuery('#ec_next_schedule span').text(next_name);
        jQuery('#ec_next_schedule').show();
    }

}


function activatePickers() {

    prev_picker = jQuery('#ec_previous_schedule');
    next_picker = jQuery('#ec_next_schedule');

    prev_picker.click(function(e) {

        cp = weekScheduleKeys.indexOf(workingScheduleKey);
        if (cp > 0) {
            workingScheduleKey = weekScheduleKeys[cp - 1];
            buildScheduleDisplay();
        }

    });
    next_picker.click(function(e) {

        cp = weekScheduleKeys.indexOf(workingScheduleKey);
        if (cp < workingScheduleKey.length) {
            workingScheduleKey = weekScheduleKeys[cp + 1];
            buildScheduleDisplay();
        }

    });

}


jQuery(function(){


    jQuery.ajax({
        url: 'https://eatonfellowship.github.io/eaton.ics',
        //url: 'http://localhost:8000/eaton.ics',
        dataType: 'text',
        success: function(data){
			var jcalData = ICAL.parse(data);
			var comp = new ICAL.Component(jcalData);
			jcalTimezoneComp = comp.getFirstSubcomponent('vtimezone');
			jcalTzId = jcalTimezoneComp.getFirstPropertyValue('tzid');

			icalTimezone = new ICAL.Timezone({
				component: jcalTimezoneComp,
				jcalTzId
			});
			icalToday.convertToZone(icalTimezone)

			var vevents = comp.getAllSubcomponents('vevent');
			
			var iterStartTime = new ICAL.Time({
			    year: icalToday.year,
			    month: icalToday.month,
			    day: icalToday.day,
			    minute: 0,
			    second: 1,
			    isDate: false
			});
			
			for (var i in vevents) {
			
			    vevent = vevents[i];
			    var event = new ICAL.Event(vevent);
			
			    if (event.isRecurring()) {
			        var iter = event.iterator(iterStartTime);
			        X = 0;
			        while (X < daysForward && (next = iter.next())) {
			            X = X + 1;
			            var key = next.year + '-' + addZero(next.month) + '-' + addZero(next.day);
			
			            // ignore it if it isn't in our list of daysForward.
			            if (!(key in weekSchedule)) continue;
			
			
			            weekSchedule[key].events.push({
			                'summary': event.summary,
			                'description': event.description,
			                'starttime': addZero(event.startDate.hour) + addZero(event.startDate.minute),
			                'endtime': addZero(event.endDate.hour) + addZero(event.endDate.minute)
			            });
			
			
			
			        }
			    }
			    // if today is greater than the start date then ignore it since it's not recurring
			    else if (iterStartTime.compareDateOnlyTz(event.startDate, icalTimezone) === 1) {
			        continue;
			    } else {
			
			        var esd = event.startDate.convertToZone(icalTimezone);
			
			        var key = esd.year + '-' + addZero(esd.month) + '-' + addZero(esd.day);
			
			        // ignore it if it isn't in our list of daysForward.
			        if (!(key in weekSchedule)) continue;
			
			
			        weekSchedule[key].events.push({
			            'summary': event.summary,
			            'description': event.description,
			            'starttime': addZero(esd.hour) + addZero(esd.minute),
			            'endtime': addZero(event.endDate.hour) + addZero(event.endDate.minute)
			        });
			
			    }
			
			}
			
			for (var key in weekSchedule) {
			
			    weekSchedule[key].events.sort((a, b) => {
			
			        let sta = parseInt(a.starttime),
			            stb = parseInt(b.starttime);
			
			        return sta - stb;
			
			    });
			
			}
			

			todaykey = icalToday.year + '-' + addZero(icalToday.month) + '-' + addZero(icalToday.day);
			workingScheduleKey = todaykey;


			
        },
        complete: function(jqXHR, textStatus) {
			buildScheduleDisplay();
			activatePickers();
        }
    });


});
