let myCanvas = document.getElementById("myCanvas");
myCanvas.width = 300;
myCanvas.height = 300;
                        
let ctx = myCanvas.getContext("2d");

let userData = {
    "New Members that have 2FA": 20,
    "New Members that have never used 2FA": 30
}

function drawLine(ctx, startX, startY, endX, endY){
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
}
function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
}
function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
}

let Piechart = function(options){
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
                    
    this.draw = function(){
        let total_value = 0;
        let color_index = 0;
        for (let categ in this.options.data){
            let val = this.options.data[categ];
            total_value += val;
        }
                    
        let start_angle = 0;
        for (let categ in this.options.data){
            let val = this.options.data[categ];
            let slice_angle = 2 * Math.PI * val / total_value;
                    
            drawPieSlice(
                this.ctx,
                this.canvas.width/2,
                this.canvas.height/2,
                Math.min(this.canvas.width/2,this.canvas.height/2),
                start_angle,
                start_angle+slice_angle,
                this.colors[color_index%this.colors.length]
            );
                    
            start_angle += slice_angle;
            color_index++;
        }

        // for the donut hole
        if (this.options.doughnutHoleSize){
            drawPieSlice(
                this.ctx,
                this.canvas.width/2,
                this.canvas.height/2,
                this.options.doughnutHoleSize * Math.min(this.canvas.width/2,this.canvas.height/2),
                0,
                2 * Math.PI,
                "$color-white"
            );
        }

        start_angle = 0;
        for (categ in this.options.data){
            val = this.options.data[categ];
            slice_angle = 2 * Math.PI * val / total_value;
            let pieRadius = Math.min(this.canvas.width/2,this.canvas.height/2);
            let labelX = this.canvas.width/2 + (pieRadius / 2) * Math.cos(start_angle + slice_angle/2);
            let labelY = this.canvas.height/2 + (pieRadius / 2) * Math.sin(start_angle + slice_angle/2);
                                
            if (this.options.doughnutHoleSize){
                let offset = (pieRadius * this.options.doughnutHoleSize ) / 2;
                labelX = this.canvas.width/2 + (offset + pieRadius / 2) * Math.cos(start_angle + slice_angle/2);
                labelY = this.canvas.height/2 + (offset + pieRadius / 2) * Math.sin(start_angle + slice_angle/2);               
            }
                                
            let labelText = Math.round(100 * val / total_value);
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 20px Arial";
            this.ctx.fillText(labelText+"%", labelX,labelY);
            start_angle += slice_angle;
        }
    }
}

let myPiechart = new Piechart(
    {
        canvas:myCanvas,
        data:userData,
        colors:["$color-skyblue", "$color-brightblue"],
        doughnutHoleSize:0.4
    }
);
myPiechart.draw();