'use strict';

window.UploadFormUtils = (function() {

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

    // Adapted from:
    // "Use HTML5 to resize an image before upload"
    // https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload#24015367
    function do_resize_image(promise, file, maxSize, fileName) {

        // Load the image
        var reader = new FileReader();
        reader.onload = function(readerEvent) {
            var image = new Image();
            image.onload = function(imageEvent) {

                // Resize the image
                var canvas = document.createElement('canvas');
                var width = image.width;
                var height = image.height;
                var need_resize = false;
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                        need_resize = true;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                        need_resize = true;
                    }
                }

                if (need_resize) {
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                    var dataUrl = canvas.toDataURL('image/jpeg');

                    if (fileName) {
                        var resizedImage = dataURLToBlob(dataUrl);
                        var file = new File([resizedImage], fileName);
                        promise.resolve(file);
                    }
                    else {
                        promise.resolve(dataUrl);
                    }
                }
                else {
                    promise.resolve(file);
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

        if (file.type.match(/image.*/)) {
            reader.readAsDataURL(file);
        }
        else {
            promise.resolve(file);
        }
    }


    /**
     * Update chart options.
     *
     * Updates existing chart options with specified values;
     *
     * @param {object} options - a dictionary of chart options
     *
     * @returns {boolean} true iif chart needs reload (for example: max_points has changed)
     */




    function resize_image(blob, maxSize) {

        //maxSize = 10000;

        var promise = $.Deferred();

        if (blob.type.match(/image.*/)) {

            if (blob instanceof File) {
                do_resize_image(promise, blob, maxSize, blob.name);
            }
            else if (blob instanceof Blob) {
                do_resize_image(promise, blob, maxSize, null);
            }
            else {
                promise.reject('Unable to resize unknown object');
            }

        }
        else {
            promise.resolve(file);
        }


        return promise;
    }

    return {
        resize_image: resize_image
    };

})();
