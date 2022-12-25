
const googId = 'G-WQPMM44JGT';

export const googScript = `
<script async src="https://www.googletagmanager.com/gtag/js?id=${googId}" id="${googId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config',"${googId}");
</script>
`;

export const addGoogScript = ($: any) => {
    if ($.has(`#${googId}`).length === 0 ) {
        $.append(googScript);
    }
}
