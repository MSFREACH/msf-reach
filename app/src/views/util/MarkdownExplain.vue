<template lang="html">
    <div class="modal-dialog" role="document">
        <div class="explain-section">
            <h3> HEADERS </h3>
            # This is an &lt;h1&gt; tag <br/>
            ## This is an &lt;h2&gt; tag <br/>
            ###### This is &lt;h6&gt; tag <br/>
        </div>

        <div class="explain-section">
            <h3> EMPHASIS </h3>
            *italic* or _italic_<br/>
            **bold** or __bold__ <br/>
            ***bold italics*** or ___bold italics___<br/>
            ~~Strikethrough~~<br/>
        </div>

        <div class="explain-section">
            <h3> FORMAT </h3>
            > blockquote <br/>
            Unordered List <br/>
                * Item 1 <br/>
                * Item 2 <br/>
            Ordered List <br/>
                1. Item 1 <br/>
                2. Item 2 <br/>
        </div>

        <div class="explain-section">
            <h3> MEDIA </h3>
            <label> IMAGES </label>
            ![Event Photo](/images/day1.png)<br/>
            Format: ![Alternative Text](image url)<br/>

            <label> LINKS </label>
            [hyperlink text](http://hyperlink-url/)<br/>
        </div>

        <div class="explain-section">
            <h3> TABLES </h3>
            <i>You can create tables by assembling a list of words and dividing them with hyphens - (for the first row), and then separating each column with a pipe | : </i><br/>
                First Header | Second Header <br/>
                ------------ | ------------- <br/>
                Content from cell 1 | Content from cell 2 <br/>
                Content in the first column | Content in the second column <br/>
        </div>

        <div> more info on
            <a href="https://en.wikipedia.org/wiki/Markdown" target="_blank">WIKI </a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MarkDownExplain',
}
</script>

<style lang="css">
    .modal-dialog{
        border: 1px solid #eee;
        border-radius: 15px;
        padding: 20px;
        background: #D0D3DA;
    }
    .explain-section h3{
        margin-top: 0;
    }

    .explain-section{
        display: inline-block;
        background-color: #f6f6f6;
        padding: 20px;
        border-radius: 10px;
        vertical-align: top;
        max-width: 400px;
        margin: 5px;
    }
</style>
