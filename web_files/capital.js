	//arbor.ParticleSystem(repulsion, stiffness, friction, gravity, fps, dt, precision)
	//var canvas = $(canvas).get(0);
	//var ctx = canvas.getContext("2d");
    var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem

    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80)
        that.initMouseHandling()
      },
      
      redraw:function(){
        ctx.fillStyle = "#dae6f0";
        ctx.fillRect(0,0, canvas.width, canvas.height)
        
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(0,0,0, .333)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          var w = 10
          //ctx.fillStyle = (node.data.alone) ? "orange" : "black";
		  mycolor = getColorForPercentage(Math.min(node.data.weight/node.data.maxWeight, 1));
		  ctx.fillStyle = 'rgb('+mycolor+')';
		  ctx.strokeStyle = 'rgb('+mycolor+')';
          //ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w)
		  ctx.beginPath();
		  ctx.arc(pt.x, pt.y, w, 0,2*Math.PI);
		  ctx.fill();
		  ctx.stroke();
		  ctx.fillStyle = "black";
		  ctx.fillText(node.data.content, pt.x, pt.y);
        })    			
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    

  var sys;

function initCapitalGraph(treeData){
	sys = arbor.ParticleSystem(1000, 600, 0.5, false, 55, 0.02, 1);
	
	if (treeData.edges.length == 0) { // ARBRE D'UN SEUL NOEUD
		sys.parameters({ friction: '1' });
	}
	
	sys.renderer = Renderer("#viewport");
	sys.graft(treeData);
	
}

function refreshTree(node)
{
	var total = 0;
	var length = node.data.children.length;
	
	
	if (node.data.rules == 'moyenne')
	{
		for (var i = 0; i < length; i++) {
			element = node.data.children[i];
			tmp = sys.getNode(element.id);
			//alert(element.weight);
			if (tmp.data.weight != null)
				total = total + parseFloat(tmp.data.weight);
		}
		node.data.weight = total / i;
		
	}
	if (node.data.rules == 'addition')
	{
		
		for (var i = 0; i < length; i++) {
			element = node.data.children[i];
			tmp = sys.getNode(element.id);
			//alert(element.weight);
			if (tmp.data.weight != null)
				total = total + parseFloat(tmp.data.weight);
		}
		node.data.weight = total;
	}
	if (node.data.rules == 'choice')
	{
		for (var i = 0; i < length; i++) {
			element = node.data.children[i];
			tmp = sys.getNode(element.id);
			//alert(element.weight);
			if (tmp.data.weight != null)
				total = Math.max(total, parseFloat(tmp.data.weight));
		}
		node.data.weight = total;
		
	}
	if (node.data.rules == 'mult')
	{
		total = 1;
		for (var i = 0; i < length; i++) {
			element = node.data.children[i];
			tmp = sys.getNode(element.id);
			//alert(element.weight);
			if (tmp.data.weight != null)
				total = total * parseFloat(tmp.data.weight);
		}
		node.data.weight = total;
		
	}
	
	$('#grade'+node.data.id).html(node.data.weight + "/" + node.data.maxWeight);
	//alert(node.data.id);
	parentNode = sys.getNode(node.data.motherId);
	
	if (typeof parentNode != 'undefined')
		refreshTree(parentNode);
}

function changeSelectedIndicator(criteriaId)
{
	indicId = $("#select-"+criteriaId).val();
	//alert(criteriaId + " et " + indicId);
	$.post("ajaxDispatcher.php",
                        {action:"changeIndicator", criteriaId: criteriaId, indicId : indicId},
                        function(data){
							// change color of the tree.
							nodeTochange = sys.getNode(criteriaId);							
							nodeTochange.data.weight = indicId.split(",")[1];
							//alert(nodeTochange.data.weight);
							parentNode = sys.getNode(nodeTochange.data.motherId);
							
							if (parentNode)
								refreshTree(parentNode);
							
							sys.renderer.redraw();
							
                });
}

