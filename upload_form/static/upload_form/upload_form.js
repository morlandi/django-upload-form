'use strict';

$(document).ready(function($) {
    UploadForm.initialize($('.uploadform_drop_area'));
});

/*
TODO: Use HTML5 to resize an image before upload

https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload
*/

// Today we feel zealous enough to use the Module Pattern ;)
window.UploadForm = (function() {

    function initialize(dropArea) {
        //UploadFormFileList.initialize('.uploadform_drop_area .file_list_wrapper');
        //var dropArea = $('.uploadform_drop_area');
        UploadFormFileList.initialize(dropArea.find('.file_list_wrapper'));
        dropArea.on('dragenter dragover', function(event) {
            event.preventDefault();
            dropArea.addClass('highlight');
        });
        dropArea.on('dragleave', function(event) {
            event.preventDefault();
            dropArea.removeClass('highlight');
        });
        dropArea.on('drop', onDropAreaDrop);
        dropArea.find('form').on('submit', onFormSubmit);
    }

    function onDropAreaDrop(event) {

        event.preventDefault();
        var target = $(event.target);
        var dropArea = target.closest('.uploadform_drop_area');

        dropArea.removeClass('highlight');
        //var files = event.dataTransfer.files;
        //event.originalEvent.dataTransfer.dropEffect = 'copy';
        var files = event.originalEvent.dataTransfer.files;
        dropArea.find('form input[type="file"]').prop('files', files);
        handleFiles(files);
    }

    function handleFiles(files) {
        // Append new files to fileList
        $(files).each(function(index, file) {
            UploadFormFileList.add(file);
        });

        // Update UI
        UploadFormFileList.refreshUI();
    }

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
    }

    function onFormSubmit(event)
    {
        event.preventDefault();

        var target = $(event.target);
        var dropArea = target.closest('.uploadform_drop_area');
        //var dropArea = $('.uploadform_drop_area');
        var form = $(dropArea.find('form'));

        dropArea.find('.progress').show();
        var progressBar = dropArea.find('.progress-bar');
        var url = form.attr('action');

        var filelist = UploadFormFileList.get_filelist();

        // if (UPLOAD_FORM_PARALLEL_UPLOAD) {
        //     $(filelist).each(function(index, file) {
        //         sendSingleFile(dropArea, file, url);
        //     });
        // }
        // else {
        //     sendMultipleFiles(dropArea, filelist, url, progressBar);
        // }

        if (UPLOAD_FORM_PARALLEL_UPLOAD) {
            // EXPERIMENTAL
            // wait for multiple AJAX requests to finish [duplicate]
            // see: https://stackoverflow.com/questions/6538470/jquery-deferred-waiting-for-multiple-ajax-requests-to-finish
            var promises = [];
            $(filelist).each(function(index, file) {
                var data = new FormData();
                //data.append('title', 'ciao');
                data.set('files', file);
                promises.push(sendFormData(data, url, null));
            });
            $.when.apply($, promises)
                .done(function(data) {
                    onSendFormDataDone(dropArea, data)
                })
                .fail(onSendFormDataFail);
        }
        else {
            var data = new FormData();

            var inputs = form.serializeArray();
            $.each(inputs, function (i, input) {
                data.append(input.name, input.value);
            });
            //data.append('title', 'ciao');

            if (MAX_IMAGE_SIZE <= 0 ) {
                $(filelist).each(function(index, file) {
                    data.append('files', file);
                });
                var promise = sendFormData(data, url, progressBar);
                promise
                    .done(function(data) {
                        onSendFormDataDone(dropArea, data)
                    })
                    .fail(onSendFormDataFail);
            }
            else {
                var deferreds = [];
                $(filelist).each(function(index, file) {
                    deferreds.push(
                        UploadFormUtils.resize_image(file, MAX_IMAGE_SIZE)
                    )
                });

                // https://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when
                $.when.apply($, deferreds).then(function() {
                    var objects = arguments;
                    $(objects).each(function(index, file) {
                        // debugger
                        // var file = new File([obj], "ciao.jpg");
                        data.append('files', file);
                    });

                    var promise = sendFormData(data, url, progressBar);
                    promise
                        .done(function(data) {
                            onSendFormDataDone(dropArea, data)
                        })
                        .fail(onSendFormDataFail);
                });
            }
        }
    }

    function sendFormData(data, url, progressBar) {
        // console.log('data: %o', data);
        // for (var pair of data.entries()) { console.log('%o: %o', pair[0], pair[1]); }
        // debugger

        var promise = $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,
            headers: {"X-CSRFToken": getCookie('csrftoken')},
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(e) {
                    //console.log(Math.floor(e.loaded / e.total *100) + '%');
                    if (progressBar !== null) {
                        //var progress = sprintf("%d%%", Math.floor(e.loaded / e.total *100));
                        var progress = Math.floor(e.loaded / e.total *100) + '%';
                        progressBar.css('width', progress);
                        progressBar.text(progress);
                    }
                };
              return xhr;
            }
        });
        return promise;
    }

    function onSendFormDataDone(dropArea, data) {
        var response = data;
        if (Array.isArray(data)) {
            response = data[0];
        }
        switch (response.action) {
            case 'replace':
                dropArea.replaceWith(response.html);
                //initialize(dropArea);
                // TODO: TO BE REFACTORED
                initialize($('.uploadform_drop_area'));
                break;
            case 'redirect':
                window.location.replace(response.url);
                break;
        }
    }

    function onSendFormDataFail(jqXHR, textStatus) {
        console.log('ERROR: %o', jqXHR);
        alert('ERROR: ' + jqXHR.statusText);
        window.location.replace(url);
    }

    // function sendSingleFile(dropArea, file, url) {

    //     console.log('sending file "%o"', file);
    //     var data = new FormData();
    //     data.set('files', file);

    //     var promise = sendFormData(data, url, null);

    //     promise.done(function(data) {
    //         switch (data.action) {
    //             case 'replace':
    //                 //initialize(dropArea);
    //                 // TODO: TO BE REFACTORED
    //                 initialize($('.uploadform_drop_area'));
    //                 break;
    //             case 'redirect':
    //                 //window.location.replace(data.url);
    //                 console.log('done');
    //                 break;
    //         }
    //     }).fail(function(jqXHR, textStatus) {
    //         console.log('ERROR: %o', jqXHR);
    //         alert('ERROR: ' + jqXHR.statusText);
    //         window.location.replace(url);
    //     });
    // }

    // function sendMultipleFiles(dropArea, filelist, url, progressBar) {

    //     // Retrieve files from form:
    //     //var data = new FormData(form.get(0));

    //     console.log('sending files "%o"', filelist);

    //     // Retrieve files from fileList;
    //     // As with regular form data, you can append multiple values with the same name.
    //     var data = new FormData();
    //     $(filelist).each(function(index, file) {
    //         data.append('files', file);
    //         //data.append('title', 'ciao');
    //     });

    //     var promise = sendFormData(data, url, progressBar);

    //     promise.done(function(data) {
    //         switch (data.action) {
    //             case 'replace':
    //                 dropArea.replaceWith(data.html);
    //                 //initialize(dropArea);
    //                 // TODO: TO BE REFACTORED
    //                 initialize($('.uploadform_drop_area'));
    //                 break;
    //             case 'redirect':
    //                 window.location.replace(data.url);
    //                 break;
    //         }
    //     }).fail(function(jqXHR, textStatus) {
    //         console.log('ERROR: %o', jqXHR);
    //         alert('ERROR: ' + jqXHR.statusText);
    //         window.location.replace(url);
    //     });
    // }

    return {
        initialize: initialize,
        handleFiles: handleFiles
    };

})();
