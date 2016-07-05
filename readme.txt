------------------------------------------------------------------------
Copyright (C) @maps4news interactive maps (v2.0)
------------------------------------------------------------------------
x   Upload this folder to a directory on your server.
x   Add m4n.js to your page.
x   Add the following HTML to your webpage
    <div id="[id]">
        <script> var map = new M4nInteractive({ path: [path], environment: 'local' }, document.getElementById( [id] ) ); </script>
    </div>
x  Replace the two [id]'s with both the same unique id and [path] with a relative reference to the tile directory.