'use strict';

// Adapted from:
// "Use HTML5 to resize an image before upload"
// https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload#24015367

window.UploadFormResize = (function() {

    /* Utility function to convert a canvas to a BLOB */
    var dataURLToBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

    function do_resize_image(file, maxSize, fileName, toFile) {

        var promise = $.Deferred();

        // Load the image
        var reader = new FileReader();
        var name = "hello";
        reader.onload = function(readerEvent) {
            var image = new Image();
            image.onload = function(imageEvent) {
                // Resize the image
                var canvas = document.createElement('canvas'),
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');

                debugger
                if (toFile) {
                    var resizedImage = dataURLToBlob(dataUrl);
                    var file = new File([resizedImage], fileName);
                    promise.resolve(file);
                }
                else {
                    promise.resolve(dataUrl);
                }

                // $.event.trigger({
                //     type: "imageResized",
                //     blob: resizedImage,
                //     url: dataUrl
                // });
                //console.log('dataUrl: %o', dataUrl);
                //$('#target-image').attr('src', dataUrl);
                //promise.resolve(dataUrl, resizedImage, fileName);
                //promise.resolve(file);
                //dataUrl, resizedImage, fileName);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);

        return promise;
    }

    function resize_image_to_DataURL(file, maxSize) {
        debugger
        return do_resize_image(file, maxSize, file.name, false);
    }

    function resize_image_to_File(file, maxSize) {
        return do_resize_image(file, maxSize, file.name, true);
    }

    function resize_image(blob_or_file, maxSize) {
        if (blob_or_file instanceof Blob) {
            return do_resize_image(blob_or_file, maxSize, null, false);
        }
        else if (blob_or_file instanceof File) {
            return do_resize_image(blob_or_file, maxSize, blob_or_file.name, true);
        }
    }

    return {
        resize_image_to_DataURL: resize_image_to_DataURL,
        resize_image_to_File: resize_image_to_File
    };

})();
