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

    // https://stackoverflow.com/questions/23150333/html5-javascript-dataurl-to-blob-blob-to-dataurl
    function blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {callback(e.target.result);}
        a.readAsDataURL(blob);
    }

    /**
     * Resizes specified image to max_size.
     *
     * @param {file_or_blob} - a blob of file object containing the image to be resized
     * @param {max_size} - max size of the desired image
     *
     * @returns {promise} - an async value that, when resolved, will receive the resulting
     *                      eventully resized image
     *
     * How if works:
     * - if the blob received is not an image,
     *       or the source image is already smaller than max_size,
     *       the original object will be returned (unchanged)
     * - if the source blob is a File, a resized File will be returned
     * - if the source blob is just a Blob, the dataURL of the resized image will be returned
     *
     * Note that:
     * - if the source object is a File, you will always receive a File (either unchanged or resized)
     * - if the source object is just a Blob, you wil reeceive either the unchanged Blob or a dataURL
     *
     */

    function resize_image(file_or_blob, max_size) {

        // Adapted from:
        // "Use HTML5 to resize an image before upload"
        // https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload#24015367
        function _resize_image_inner() {

            // Load the image
            var reader = new FileReader();
            reader.onload = function(readerEvent) {
                var image = new Image();
                image.onload = function(imageEvent) {

                    // Calculate target width and height
                    var width = image.width;
                    var height = image.height;
                    var need_resize = false;
                    if (width <= 0 || height <=0) {
                        need_resize = false;
                    }
                    else {
                        if (width > height) {
                            if (width > _maxSize) {
                                height *= _maxSize / width;
                                width = _maxSize;
                                need_resize = true;
                            }
                        } else {
                            if (height > _maxSize) {
                                width *= _maxSize / height;
                                height = _maxSize;
                                need_resize = true;
                            }
                        }
                    }

                    // Either resize the image ...
                    var canvas = document.createElement('canvas');
                    if (need_resize) {
                        console.log("resize_image(%d): Resizing %o from %dx%d to %dx%d", _maxSize, (_blob instanceof File) ? _blob.name : "blob", image.width, image.height, width, height);
                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                        var dataUrl = canvas.toDataURL('image/jpeg');

                        if (_blob instanceof File) {
                            var resizedImage = dataURLToBlob(dataUrl);
                            var file = new File([resizedImage], _blob.name);
                            _promise.resolve(file);
                        }
                        else {
                            _promise.resolve(dataUrl);
                        }
                    }
                    else {
                        // ... or return blob unchanged
                        console.log("resize_image(%d): No resize needed for %o (%dx%d)", _maxSize, (_blob instanceof File) ? _blob.name : "blob", image.width, image.height);
                        _promise.resolve(_blob);
                    }
                    // $.event.trigger({
                    //     type: "imageResized",
                    //     blob: resizedImage,
                    //     url: dataUrl
                    // });
                }
                image.src = readerEvent.target.result;
            }

            reader.readAsDataURL(_blob);
        }


        var _promise = $.Deferred();
        var _blob = file_or_blob;
        var _maxSize = max_size;

        if (_blob instanceof Blob) {
            if (_blob.type.match(/image.*/)) {
                _resize_image_inner();
            }
            else {
                _promise.resolve(_blob);
            }
        }
        else {
            _promise.reject('Unable to resize unknown object');
        }

        return _promise;
    }

    return {
        dataURLToBlob: dataURLToBlob,
        blobToDataURL: blobToDataURL,
        resize_image: resize_image
    };

})();
