var cpu = {
	
	ram: [],
	
	updateAnnotations: function() {
		var d = $('#drawing').html("");
		var w = d.width();
		var h = d.height();
		var paper = Raphael("drawing", w, h);
		paper.clear();

		function connect(from, to, attributes, label, labelAttributes) {

			function getX(i, a) {
				switch(a){
					case 'left':
						return i.position().left;
					break;
					case 'right':
						return i.position().left + i.outerWidth(true);
					break;
					case 'middle':
						return i.position().left + (i.outerWidth(true) / 2);
					break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().left + (i.outerWidth(true) * percentage / 100);
					break;
				}
			}
			
			function getY(i, a) {
				switch(a) {
					case 'top':
						return i.position().top;
					break;
					case 'bottom':
						return i.position().top + i.outerHeight(true);
					break;
					case 'middle':
						return i.position().top + (i.outerHeight(true) / 2);
					break;
					default:
						var percentage = parseInt(a.replace("%", ""));
						return i.position().top + (i.outerHeight(true) * percentage / 100);
				}
			}
			var x1 = getX(from.e, from.h);
			var x2 = x1;
			if(to.h) {
				x2 = getX(to.e, to.h);
			}
			
			var y1 = getY(from.e, from.v);
			var y2 = y1;
			if(to.v) {
				y2 = getY(to.e, to.v);
			}
			
			var e = paper.path("M" + Math.floor(x1) + " " + Math.floor(y1) + "L" +  Math.floor(x2) + " " + Math.floor(y2));
			if(attributes === undefined) {
				attributes = {"stroke-width": 10, "arrow-end":"block-narrow-short"};
			}
			e.attr(attributes);
			
			if(label) {
				var x = Math.floor((x1 + x2) / 2);
				var y = Math.floor((y1 + y2) / 2);
				var text = paper.text(x, y, label);
				if(labelAttributes) {
					text.attr(labelAttributes);
				}
			}
		}
		
		var PC = $('#reg_pc');
		var MAR = $('#reg_mar');
		var decodeUnit = $('.decode_unit');
		var MDR = $('#reg_mdr');
		var CIR = $('#reg_cir');
		var ALU = $('#alu');
		var ACC = $('#reg_acc');
		var CPU = $('.cpu');
		var RAM = $('.ram');
		
		connect({e:ALU, h:"left", v:"middle"}, {e:decodeUnit, h:"right"}, {"stroke-width": 10, "arrow-start":"block-narrow-short"});
		connect({e:PC, h:"right", v:"middle"}, {e:MAR, h:"left", v:"middle"});
		connect({e:decodeUnit, h:"60%", v:"top"}, {e:PC, v:"bottom"});
		connect({e:decodeUnit, h:"80%", v:"top"}, {e:MAR, h:"left", v:"bottom"});
		connect({e:MDR, h:"middle", v:"bottom"}, {e:CIR, h:"middle", v:"top"});
		connect({e:CIR, h:"left", v:"middle"}, {e:decodeUnit, h:"right"});
		connect({e:MDR, h:"20%", v:"top"}, {e:ALU, v:"bottom"});
		connect({e:ACC, h:"20%", v:"bottom"}, {e:ALU, v:"top"}, {"stroke-width": 10, "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"});
		connect({e:MDR, h:"80%", v:"top"}, {e:ACC, h:"80%", v:"bottom"}, {"stroke-width": 10, "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"});
		
		connect({e:CPU, h:"right", v:"5%"}, {e: RAM, h:"left"}, {"stroke-width": 20, "stroke": "#F00", "arrow-end":"block-narrow-short"}, "Address bus");
		connect({e:CPU, h:"right", v:"56%"}, {e: RAM, h:"left"}, {"stroke-width": 20, "stroke": "#F00", "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"}, "Data bus");
		connect({e:CPU, h:"right", v:"85%"}, {e: RAM, h:"left"}, {"stroke-width": 20, "stroke": "#F00", "arrow-end":"block-narrow-short", "arrow-start": "block-narrow-short"}, "Control bus");
	},
	
	init: function(jqCPU) {
		$(window).resize(cpu.updateAnnotations);
		cpu.jqCPU = jqCPU;
		var html ='<div id="drawing"></div><div class="ram"><h3><i class="fa fa-list"></i> RAM</h3>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Address</th><th>Value</th></tr></thead>';
		var params = window.location.search.substr(1);
		var ram = [];
		var initZeros = true;
		if(ram = params.replace("ram=", "")) {
			if(ram = ram.match(/([0-9a-fA-F]{2})/g)) {
				initZeros = false;
			}
		}
		for(var address = 0; address < 16; address++) {
			cpu.ram[address] = initZeros? 0 : cpu.hex2dec(ram[address]);
			html += '<tr><td id="ram_address_' + address + '" class="value value_denary">' + address + '</td><td id="ram_value_' + address + '" class="value value_denary editable" data-description="Memory address ' + address + '">' + cpu.ram[address] + '</td></tr>';
		}
		html += '</table>';
		html += '</div>';
		
		
		html += '<div class="cpu"><h3><i class="fa fa-microchip"></i> CPU</h3>';
		
		function getRegisterHtml(name, value, desc) {
			return '<div class="register" id="reg_' + name.toLowerCase()+'"><div class="reg_name">' + name + '</div><div id="reg_' + name.toLowerCase() + '_val" class="reg_val value value_denary editable" data-description="' + desc + '">' + value + '</div></div>';
		}
		html += getRegisterHtml('PC', 0, "Program Counter");
		html += getRegisterHtml('MAR', 0, "Memory Address Register");
		html += getRegisterHtml('MDR', 0, "Memory Data Register");
		html += getRegisterHtml('ACC', 0, "Accumulator");
		html += getRegisterHtml('CIR', 0, "Current Instruction Register");
		
		html += '<div id="alu">ALU</div>';
		html += '<div id="cu">CU</div>';
		
		
		html += '<div class="decode_unit"><h4><i class="fa fa-info-circle"></i> Decode unit</h2>';
		html += '<table class="table table-fixed table-striped table-hover"><thead><tr><th>Opcode</th><th>Operand</th><th>Instruction</th></tr></thead>';
		html += '<tr class="decode_row_0"><td>0000</td><td>0000</td><td>End</td></tr>';
		html += '<tr class="decode_row_1"><td>0001</td><td>address</td><td>Add</td></tr>';
		html += '<tr class="decode_row_2"><td>0010</td><td>address</td><td>Subtract</td></tr>';
		html += '<tr class="decode_row_3"><td>0011</td><td>address</td><td>Store</td></tr>';
		html += '<tr class="decode_row_5"><td>0101</td><td>address</td><td>Load</td></tr>';
		html += '<tr class="decode_row_6"><td>0110</td><td>address</td><td>Branch Always</td></tr>';
		html += '<tr class="decode_row_7"><td>0111</td><td>address</td><td>Branch if ACC = 0</td></tr>';
		html += '<tr class="decode_row_8"><td>1000</td><td>address</td><td>Branch if ACC >= 0</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0001</td><td>Input</td></tr>';
		html += '<tr class="decode_row_9"><td>1001</td><td>0010</td><td>Output</td></tr>';
		html += '</div>';
		
		html += '</div>';
		$(jqCPU).html(html);
		cpu.updateAnnotations();
	}
};
$(function() {
	cpu.init("#cpu")
});