var allStates = $("svg.in > *");

var modal = document.getElementById("myModal");

var span = document.getElementsByClassName("close")[0];

var url = "https://api.rootnet.in/covid19-in/stats/latest";

var history_url = "https://api.rootnet.in/covid19-in/stats/history";


async function history_getData(){
    const history_response = await fetch(history_url);
    const history_api_data = await history_response.json();
    let length = history_api_data.data.length;

    const today_increses = history_api_data.data[length-1].summary.total - history_api_data.data[length-2].summary.total;
    document.getElementById('increase').innerText = '(' + '+' + today_increses + ' Today' +')'
    
    return history_api_data.data;
}


async function getData(){
    const response = await fetch(url);
    const api_data = await response.json();

    document.getElementById("total_count").innerText = api_data.data.summary.total;
    document.getElementById("total_active").innerText = api_data.data.summary.total - (api_data.data.summary.discharged + api_data.data.summary.deaths);
    document.getElementById("total_death").innerText = api_data.data.summary.deaths;
    document.getElementById("total_recover").innerText = api_data.data.summary.discharged;

    refreshTime = new Date(api_data.lastRefreshed); 
    var amPm = refreshTime.getHours()>=12 ? ' PM':' AM'

    document.getElementById("refresh_time").innerText = '(' + refreshTime.toDateString()+' at '+ refreshTime.getHours() + ':'+ refreshTime.getMinutes() + amPm  +')';



    return api_data.data.regional;

}

getAllData();


getData();
history_getData();



allStates.on("click", function() {
  
    allStates.removeClass("on");
    $(this).addClass("on");

    var title = $(this).attr('title');

    getData().then(function(states) {
        for(let state in states){
            if(states[state].loc == title){
                var totalCases = states[state].confirmedCasesIndian + states[state].confirmedCasesForeign;
                var discharged = states[state].discharged;
                var deaths = states[state].deaths;
                document.getElementById('top-total').innerText = totalCases;
                document.getElementById('active').innerText = totalCases - (deaths + discharged);
                document.getElementById('death').innerText = deaths;
                document.getElementById('recovery').innerText = discharged;

                break;
            }
        }
    });

    history_getData().then(function(history_data){
        let length = history_data.length;

        var history_states = history_data[length-1].regional;

        last_day = history_data[length-2].regional

        for(let state in history_states){
            if(history_states[state].loc == title){
                let lastDayInc = last_day[state].confirmedCasesIndian + last_day[state].confirmedCasesForeign

                let inc_today = (history_states[state].confirmedCasesIndian + history_states[state].confirmedCasesForeign) - lastDayInc; 
                document.getElementById('state_increase_today').innerText = '( +'+inc_today + ' Today )';

            }
        }
    });

    var header = document.getElementById('model-header');

    header.innerHTML = title;
    modal.style.display = "block";

        
    span.onclick = function() {
        modal.style.display = "none";
        $(this).addClass("on");
        document.getElementById('top-total').innerText = 0;
        document.getElementById('active').innerText = 0;
        document.getElementById('death').innerText = 0 ;
        document.getElementById('recovery').innerText = 0;
    }


    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementById('top-total').innerText = 0;
            document.getElementById('active').innerText = 0;
            document.getElementById('death').innerText = 0 ;
            document.getElementById('recovery').innerText = 0;
        }
    }
});

$(document).ready(function (){
	var scroll_zoom = new ScrollZoom($('#container'),4,0.5)
})


function ScrollZoom(container,max_scale,factor){
	var target = container.children().first()
	var size = {w:target.width(),h:target.height()}
	var pos = {x:0,y:0}
	var zoom_target = {x:0,y:0}
	var zoom_point = {x:0,y:0}
	var scale = 1
	target.css('transform-origin','0 0')
	target.on("mousewheel DOMMouseScroll",scrolled)

	function scrolled(e){
		var offset = container.offset()
		zoom_point.x = e.pageX - offset.left
		zoom_point.y = e.pageY - offset.top

		e.preventDefault();
		var delta = e.delta || e.originalEvent.wheelDelta;
		if (delta === undefined) {
	      //we are on firefox
	      delta = e.originalEvent.detail;
	    }
	    delta = Math.max(-1,Math.min(1,delta)) // cap the delta to [-1,1] for cross browser consistency

	    // determine the point on where the slide is zoomed in
	    zoom_target.x = (zoom_point.x - pos.x)/scale
	    zoom_target.y = (zoom_point.y - pos.y)/scale

	    // apply zoom
	    scale += delta*factor * scale
	    scale = Math.max(1,Math.min(max_scale,scale))

	    // calculate x and y based on zoom
	    pos.x = -zoom_target.x * scale + zoom_point.x
	    pos.y = -zoom_target.y * scale + zoom_point.y


	    // Make sure the slide stays in its container area when zooming out
	    if(pos.x>0)
	        pos.x = 0
	    if(pos.x+size.w*scale<size.w)
	    	pos.x = -size.w*(scale-1)
	    if(pos.y>0)
	        pos.y = 0
	     if(pos.y+size.h*scale<size.h)
	    	pos.y = -size.h*(scale-1)

	    update()
	}

	function update(){
		target.css('transform','translate('+(pos.x)+'px,'+(pos.y)+'px) scale('+scale+','+scale+')')
	}
}


