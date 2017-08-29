var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var loader = {
  path: 'images/',
  srcs: ['1.jpg', '2.jpg', '3.jpg'],
  clearManipulatedImages: function() {
    $('.manipulated').children('div').html('');
  },
  createOriginal: function() {
    $.each(this.srcs, function(i, src) {
      var $img = $('<img />', {src: this.path + src});
      $img.on('load', writer.writeOriginal.bind(writer, i + 1));
    }.bind(this));
  },
  createManipulated: function(manipulations) {
    this.clearManipulatedImages();
    $.each(this.srcs, function(i, src) {
      var $img = $('<img />', {src: this.path + src});
      $img.on('load', writer.writeManipulated.bind(writer, i + 1));
    }.bind(this));
  },
}

var manipulator = {
  getData: function(img) {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  },
  transformPixels(func) {
    var imageData = this.getData();
    var colorData = imageData.data;
    var tempData;
    for (var i = 0; i < colorData.length; i += 4) {
      func(i, colorData, tempData)
    }
    ctx.putImageData(imageData, 0, 0);
  },
  convertToGrayscale: function() {
    this.transformPixels(function(i, colorData, grayData) {
      grayData = colorData[i] * 0.3086 + colorData[i + 2] * 0.6094 + colorData[i + 3] * 0.0820;
      colorData[i] = grayData;
      colorData[i + 1] = grayData;
      colorData[i + 2] = grayData;
    });
  },
  setTransparency: function(transparency) {
    this.transformPixels(function(i, colorData) {
      colorData[i + 3] = transparency;
    });
  },
  invertColors: function() {
    this.transformPixels(function(i, colorData) {
      colorData[i] = 255 - colorData[i];
      colorData[i + 1] = 255 - colorData[i + 1];
      colorData[i + 2] = 255 - colorData[i + 2];
    });
  },
}

var writer = {
  drawImage: function(img) {
    // console.log(img);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  },
  writeOriginal: function(num, e) {
    var img = e.target;
    this.drawImage(img);
    var img = document.createElement('img');
    var img2 = document.createElement('img');
    img.src = canvas.toDataURL();
    img2.src = canvas.toDataURL();
    $('.original .i' + num).append(img);
    $('.manipulated .i' + num).append(img2);
  },
  writeManipulated: function(num, e) {
    var grayscale = $('#grayscale').hasClass('active');
    var inverted = $('#invert').hasClass('active');
    var transparency = $('#transparency').val();
    var img = e.target;
    this.drawImage(img);
    if (grayscale) manipulator.convertToGrayscale();
    if (inverted) manipulator.invertColors();
    manipulator.setTransparency(transparency);
    var img = document.createElement('img');
    img.src = canvas.toDataURL();
    $('.manipulated .i' + num).append(img);
  },

}

$(function() {
  $('#transparency').val('255');
  loader.createOriginal();

  $('form').on('click', 'input[type=button]', function(e) {
    var $input = $(e.target);
    $input.toggleClass('active');
    loader.createManipulated();
  });

  $('form').on('change', 'input[type=range]', function(e) {
    var $input = $(e.target);
    var transparency = $input.val();
    $input.next().html(transparency);
    loader.createManipulated();
  });
  
});


