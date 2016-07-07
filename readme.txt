------------------------------------------------------------------------
Copyright © @maps4news interactive maps (v2.0)
------------------------------------------------------------------------
x   Upload this folder to a directory on your server.
x   Add the following HTML to your web page
    <div id="[id]">
        <script src="[script path]"></script>
        <script>
            var map = new M4nInteractive({
                path: "[path]",
                environment: "local"
            }, document.getElementById("[id]"));
        </script>
    </div>
x  Replace the two [id]s with both the same unique id, e.g. m4n-map
x  Replace [script path] with the url to the m4n.js script found in the zip file
x  Replace [path] with a relative path to the directory with the tiles found in the zip file.
