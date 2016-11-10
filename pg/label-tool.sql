\set package labelTool
\set jsf `browserify --standalone=labelTool lib/LabelTool.js`
\set js `browserify --standalone=labelTest lib/LabelTest.js`

CREATE OR REPLACE FUNCTION detect
(auth json,urls text[],
opts json default '{"verbose":true,types=["text","labels","logos","properties"]}'::json)
RETURNS json AS $$
var lt=new labelTool(auth);
function cb(err,labels) {
  return labels;
}
lt.detect(urls,opts,cb);
$$ LANGUAGE plv8 IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION test
(opts json default '{"verbose":true,types=["text","labels","logos","properties"]}'::json)
RETURNS json AS $$
var lt=new labelTest(opt);
return lt.test();
$$ LANGUAGE plv8 IMMUTABLE STRICT;

CREATE or replace function init_injector(prefix text,js text)
RETURNS TEXT
LANGUAGE PLPGSQL AS $PL$
begin
EXECUTE FORMAT($FORMAT$
CREATE OR REPLACE FUNCTION require_%1$s() RETURNS VOID AS $INIT_FUNCTION$
%2$s
$INIT_FUNCTION$ LANGUAGE plv8 IMMUTABLE STRICT;
$FORMAT$,prefix,js);
return 'require_'||prefix;
end
$PL$;

select init_injector(:'package',:'js');
drop function init_injector(prefix text,js text);
