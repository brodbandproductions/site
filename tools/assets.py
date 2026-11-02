# copy + optimize assets into the repo; returns blob-id -> site path map
import os, shutil, subprocess
from PIL import Image
# Maps each canvas asset id (/_blob/<id>) to its file in public/.
# S is where the original media lives on the machine running the build (set BB_MEDIA to override).
# A file already present in public/ is kept as is when its original is not available.
S=os.environ.get('BB_MEDIA','/tmp/claude-0/-home-claude/e8deede6-6d24-5a37-9461-1f7fdfa45203/scratchpad/')
OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'public')+'/'
M={
 '48c214fc46204d626b8e0b2caf599d97':('merch/tee-tree-front.jpg','images/collected/tee-tree-front.jpg'),
 'e8f99448c1a42f22d93c6e3f29914630':('merch/tee-tree-side.jpg','images/collected/tee-tree-side.jpg'),
 '2039934cea3b07e84c8164732b8dc4cc':('merch/tee-crucible-front.jpg','images/collected/tee-crucible-front.jpg'),
 '575579d0f78a8676b29c3f35c3566a96':('merch/tee-crucible-side.jpg','images/collected/tee-crucible-side.jpg'),
 'eca2f974aafbf936e42b4c69c7c34991':('merch/tee-spheres-front.jpg','images/collected/tee-spheres-front.jpg'),
 '2b1dbaf9dff4d21cf293c9c5a4b7d0f6':('merch/tee-spheres-side.jpg','images/collected/tee-spheres-side.jpg'),
 'e66118f805c37a3e00adface053dd335':('merch/journal-tree.jpg','images/collected/journal-tree.jpg'),
 '5c4fd79d271a7b866b47e02ad02e9e5d':('merch/journal-tree-held.jpg','images/collected/journal-tree-held.jpg'),
 '1bd2c18faca619d3204f6d87e36fefea':('merch/journal-crucible.jpg','images/collected/journal-crucible.jpg'),
 'efcff4e0561451ee81dcc6c2446f08f2':('merch/journal-crucible-held.jpg','images/collected/journal-crucible-held.jpg'),
 'bf0890679f673f545f4d76e12dd2992d':('merch/tote-crucible.jpg','images/collected/tote-crucible.jpg'),
 '2ab34f8f187678f240ed1a02b31e2424':('merch/tote-crucible-worn.jpg','images/collected/tote-crucible-worn.jpg'),
 '770b895cf30e3a74b98afd28bc425127':('merch/tote-crucible-flat.jpg','images/collected/tote-crucible-flat.jpg'),
 '10c7bcdb05085b3caf5ae3b5a57c4098':('merch/tank-tree-front.jpg','images/collected/tank-tree-front.jpg'),
 '99d85cc86eae5c3cf6557ea3c301b557':('merch/tank-tree-side.jpg','images/collected/tank-tree-side.jpg'),
 'caf7715505d54bdbcc96d880db1d9f13':('merch/tank-tree-model.jpg','images/collected/tank-tree-model.jpg'),
 'b750c2fe1236352e699ffc20a81a1dd6':('merch/tank-tree-close.jpg','images/collected/tank-tree-close.jpg'),
 'fe2504117ebf3f58ccd24443ee167463':('merch/tank-spheres-front.jpg','images/collected/tank-spheres-front.jpg'),
 '7d92ba1ff5b86026df24dabf8bff4de6':('merch/tank-spheres-side.jpg','images/collected/tank-spheres-side.jpg'),
 '969507c7df8e79e91f948e9e715924f5':('merch/tank-spheres-model.jpg','images/collected/tank-spheres-model.jpg'),
 '4d8767fd2869fa50ad1cd59eebc0360a':('merch/tank-spheres-close.jpg','images/collected/tank-spheres-close.jpg'),
 'f102a2b271e7a0d5c2a56f210ffef3c0':('merch/print-tree.jpg','images/collected/print-tree.jpg'),
 'dc50c997afb2e05b4e25b53a9b06962d':('merch/print-tree-held.jpg','images/collected/print-tree-held.jpg'),
 '52bc50d9abc58d3f7dbd94a2914fba8a':('merch/print-crucible.jpg','images/collected/print-crucible.jpg'),
 'df99f4272ef9fd6aac6e8fd5deba8589':('merch/print-crucible-hung.jpg','images/collected/print-crucible-hung.jpg'),
 '3f2bbc8e716f6aecda9e79f07706cbb9':('merch/print-spheres.jpg','images/collected/print-spheres.jpg'),
 'd2be5560842ae5d417d9471becb08a01':('merch/framed-tree.jpg','images/collected/framed-tree.jpg'),
 '8e14f2c624bd6473c783e5cd17a76146':('merch/framed-tree-held.jpg','images/collected/framed-tree-held.jpg'),
 '9286392b7b604e4ec30056f88764c5c8':('merch/framed-crucible.jpg','images/collected/framed-crucible.jpg'),
 '7a8207a553e46976ad50262b763cd5da':('merch/framed-crucible-held.jpg','images/collected/framed-crucible-held.jpg'),
 'be3c4670bc115cd789a87be67c6ead24':('merch/band-hat-front.jpg','images/collected/hat-band-front.jpg'),
 '88dd499b3546b6a125a17d2e25299eba':('merch/band-hat-left.jpg','images/collected/hat-band-front-left.jpg'),
 '17f6a9ed03f4ab00546d3daac504c37e':('merch/band-hat-right.jpg','images/collected/hat-band-front-right.jpg'),
 '0d9367c8b2c111b056af84766422fe14':('merch/band-hat-side.jpg','images/collected/hat-band-side.jpg'),
 'ded243cbad7cfdf24c13c330ab4ab965':('merch/emblem-hat-front.jpg','images/collected/hat-seal-front.jpg'),
 'bb275574c8009ce13ba4cae726911a47':('merch/emblem-hat-left.jpg','images/collected/hat-seal-front-left.jpg'),
 '0d7d5113c30887d908db965749d6fd24':('merch/emblem-hat-side.jpg','images/collected/hat-seal-side.jpg'),
 '42fe9f0f9315b2fb94d86b91cb7c6639':('merch/emblem-hat-right.jpg','images/collected/hat-seal-front-right.jpg'),
 '0b321091132500988e05d339decc227e':('merch/mug-handle-left.jpg','images/collected/mug-wrap-handle-left.jpg'),
 'ecb309a06104ebcaeefe27ea32624349':('merch/mug-handle-right.jpg','images/collected/mug-wrap-handle-right.jpg'),
 '9cfd772e8416a324d94399adfd887fc0':('merch/dad-hat-side.jpg','images/collected/hat-dad-side.jpg'),
 '72cc92a50fe74690f8c36cd90c300109':('merch/structured-cap-side.jpg','images/collected/hat-structured-cap-side.jpg'),
 '3744cb0ff52b40f575d9d5e6983dc379':('merch/snapback-side.jpg','images/collected/hat-snapback-left.jpg'),
 '0859aa42bb2384b2092c253ca5e3c757':('merch/snapback-side2.jpg','images/collected/hat-snapback-right.jpg'),
 '2b0af47d69d06122ae6c7ee679cb6a94':('merch/plate-gathering.jpg','images/collected/plate-the-gathering.jpg'),
 '65843b3ac3b090001ecad69a8fb4b704':('merch/plate-hive.jpg','images/collected/plate-the-celestial-hive.jpg'),
 'd4a5ba872b94e6a1d27e0b1325d01069':('merch/plate-alembic.jpg','images/collected/plate-the-alembic-of-the-stars.jpg'),
 '0440f6eba2c12d608955b6c0cfde3344':('merch/shirt-tree.jpg','images/collected/shirt-the-tree.jpg'),
 'ffcd7c30b8e9b14bf5248666e2a577f1':('merch/shirt-crucible.jpg','images/collected/shirt-the-crucible.jpg'),
 '1055aad1ff775c82c68521c86ec732f3':('merch/shirt-spheres.jpg','images/collected/shirt-music-of-the-spheres.jpg'),
 '6206f821c7fa74d57edd8896a52d2c1b':('merch/mug-wrap.jpg','images/collected/mug-wrap.jpg'),
 '28cba3b25edccaeaf478b550293b77b0':('merch/dad-hat.jpg','images/collected/hat-dad.jpg'),
 'f176953e61c190bc73251e9141ee9bca':('merch/structured-cap.jpg','images/collected/hat-structured-cap.jpg'),
 '040bcbbc380f28d17a4d4d191285381d':('merch/snapback.jpg','images/collected/hat-snapback.jpg'),
 '312564c9283117c7991730fb3017ddca':('merch/beanie.jpg','images/collected/hat-beanie.jpg'),
 'b716536997e5d4001f1a70a11dbfab13':('moments/studio-moment-19.jpg','images/gallery/studio-moment-19.jpg'),
 '8157d163333f00884072107379db7499':('moments/studio-moment-20.jpg','images/gallery/studio-moment-20.jpg'),
 'bd5387cf427044ccdaecf6b910ec5874':('moments/studio-moment-01.jpg','images/gallery/studio-moment-01.jpg'),
 '672feb51500aa30d4a998a7899bc648b':('moments/studio-moment-02.jpg','images/gallery/studio-moment-02.jpg'),
 '3652fe7117125c5f648798a30836a258':('moments/studio-moment-03.jpg','images/gallery/studio-moment-03.jpg'),
 'ffe1bb74bb1b6126e786cd3c92b10b37':('moments/studio-moment-04.jpg','images/gallery/studio-moment-04.jpg'),
 '716d448e1e3313f79962813bb7b27a1c':('moments/studio-moment-05.jpg','images/gallery/studio-moment-05.jpg'),
 'e8df710f45124761ecf33ffcedece860':('moments/studio-moment-06.jpg','images/gallery/studio-moment-06.jpg'),
 '3c6a02052c3f789bd35df8feb2369be6':('moments/studio-moment-07.jpg','images/gallery/studio-moment-07.jpg'),
 'd9a066f4923a6cb5b5c8523fa3ba664d':('moments/studio-moment-08.jpg','images/gallery/studio-moment-08.jpg'),
 '7926da1d769fce1afec5df64fc27e10b':('moments/studio-moment-09.jpg','images/gallery/studio-moment-09.jpg'),
 'eafaee2c4c3f888e5f1e705b41d1773b':('moments/studio-moment-10.jpg','images/gallery/studio-moment-10.jpg'),
 'f01fb14f142d604a3ee483dbde712c88':('moments/studio-moment-11.jpg','images/gallery/studio-moment-11.jpg'),
 '72237e9d8bf0b333b92f129eb098a325':('moments/studio-moment-12.jpg','images/gallery/studio-moment-12.jpg'),
 'ef625b56c9d92caeb9d00a34eee3138d':('moments/studio-moment-13.jpg','images/gallery/studio-moment-13.jpg'),
 'ac842a12e68ddc514d99e39a3c06ef86':('moments/studio-moment-14.jpg','images/gallery/studio-moment-14.jpg'),
 '63deb4f3971d00af243ba7fb18c9caae':('moments/studio-moment-15.jpg','images/gallery/studio-moment-15.jpg'),
 '70b04cf3a0d22b64d890881fa5fcbdc3':('moments/studio-moment-16.jpg','images/gallery/studio-moment-16.jpg'),
 '0aade13989d392df72e20470a0b79806':('moments/studio-moment-17.jpg','images/gallery/studio-moment-17.jpg'),
 'd6e94424922b7a6aa83f4df0cf1b02aa':('moments/studio-moment-18.jpg','images/gallery/studio-moment-18.jpg'),
 'b7b69f0dd206f0d6721238ac6af90702':('plates/plate-featured.jpg','images/plates/featured.jpg'),
 '3ef19cc19240035629904aae9e5c5ef0':('plates/plate-animated.jpg','images/plates/animated.jpg'),
 'c26a7cfc41851407ba831233280f18d0':('plates/plate-improvised.jpg','images/plates/improvised.jpg'),
 '9a24aff9ba4de6fb0e7556864287f943':('plates/plate-collaborated.jpg','images/plates/collaborated.jpg'),
 'e06c29c2562a8feea903a4eedace77ea':('plates/plate-connected.jpg','images/plates/connected.jpg'),
 '024361982c7ee2f3d47b79b3d4c8caca':('plates/plate-404.jpg','images/plates/not-found.jpg'),
 '927598ed25bb6e0749ab00d56db9c717':('assets2/logo-wordmark.svg','images/brodband-logo.svg'),
 '66596d16f33570ccbb9952207c6682e3':('assets3/waves2-a.svg','images/waves-a.svg'),
 'fe71e51dd54c509fcfa2fbb39bb48ede':('assets3/waves2-b.svg','images/waves-b.svg'),
 '3ab8e838163c6820352fd17b9648e888':('assets3/waves2-c.svg','images/waves-c.svg'),
 'bf798a987b7e96b681ba8edf93862b42':('assets3/ai-video-1.jpg','images/animated/always.jpg'),
 '63392bb55edd1079aa817e0d52657fb1':('assets3/ai-video-2.jpg','images/animated/day-dream.jpg'),
 '4ff7ecb4a72a07639a530c8703d9024d':('assets3/ai-video-3.jpg','images/animated/move-on.jpg'),
 '36a2c47c121b043b03587e3d0d56b8cf':('assets3/ai-video-4.jpg','images/animated/rain.jpg'),
 'a5363ea2ff5682d2c31c931aa1b68eff':('assets3/ai-video-5.jpg','images/animated/steady-state.jpg'),
 '44d5807059c00810ab99b77c6c6af524':('yt/laIv4jDJq2o.jpg','images/improvised/incompetent-kangaroo.jpg'),
 '36cb52dd57f911c7dcf6384cca377c23':('yt/zlARlxiQYH0.jpg','images/improvised/handsomely.jpg'),
 '4f499742d4f2f891c93e92232b108372':('yt/SXNgg9kDZnA.jpg','images/improvised/long-form.jpg'),
 'c9581af6d2938ef81ede632d333e0373':('yt/zzT6mMlKrjQ.jpg','images/improvised/riffin.jpg'),
 'cc067f621facd78f0a77ef75d66910b5':('yt/WVN43sCsxKw.jpg','images/improvised/redo.jpg'),
 'b3a95180577d28048024fcbf27defcd7':('yt/VjeeCMj8p5g.jpg','images/collaborated/koznfkt-into-the-sun.jpg'),
 'be1f8f85d8d02fc211fefcdd2a9a6382':('yt/O2v3xnWQzis_maxresdefault.jpg','images/collaborated/koznfkt-your-name.jpg'),
 '89aa27b48c362c61788a7b80b9fa1a91':('assets2/gk-sessions.jpg','images/collaborated/gk-sessions.jpg'),
 '85452b78e732a906594b75c86955b7bb':('assets2/leaky-shack.jpg','images/collaborated/leaky-shack.jpg'),
 '80557c3166af595a3805260201807202':('assets2/cupids-coroner.jpg','images/collaborated/cupids-coroner.jpg'),
 'd700cbff1060d58f25f4dc47a53e1a8a':('assets2/koznfkt.jpg','images/collaborated/koznfkt.jpg'),
 'edc5d8676b14686a479a01e34ef3da8c':('assets2/letters-from-pluto.jpg','images/collaborated/letters-from-pluto.jpg'),
 '9cf5d64c65c5e597fad1250cd407fb6f':('assets2/jansson4.jpg','images/collaborated/jansson-iv.jpg'),
 'b251bcf116c9bac58378dea34a0b12e0':('assets2/puremud.jpg','images/collaborated/puremud.jpg'),
 '7e771d34059e6eeb28c553a3d28895b8':('assets2/jade-roads.jpg','images/collaborated/jade-roads.jpg'),
 '2f43205848bb6b83a129a0f7dcdf3167':('assets2/songs-by-tj.jpg','images/collaborated/songs-by-tj.jpg'),
 '80e12f14d208a4cf5620d3e017d09adc':('players/alex3.jpg','images/players/alex-brodsky.jpg'),
 'd875b5206ffa9a71a7f30819e01a07ad':('players/glenn3.jpg','images/players/glenn-korgaard.jpg'),
 '9c8fa6a18cf9fc595d34a2bfffc32891':('players/bass3.jpg','images/players/brian-hutchison.jpg'),
 '4250c15923301c0c09142fe868c0269d':('players/card1-tree.jpg','images/formulated/card-full-arrangement.jpg'),
 '879c08232bfd3dd8d5ad57b4534787a9':('players/card2-threads.jpg','images/formulated/card-co-written-song.jpg'),
 'bf0e0997b97c6c88e3d843be7d068400':('players/card3-filmstrip-crop.jpg','images/formulated/card-animated-video-v2.jpg'),
 'c77ef405268706f9a383613ce30b12d5':('players/card4-lantern.jpg','images/formulated/card-live-session.jpg'),
 '6575b734ee2267be666cc029a53f75d8':('players/card5-crucible-v3.jpg','images/formulated/card-release-ready-v2.jpg'),
 '3212aaac7f1d7abeb9f2349c5e4915b8':('players/card6-door.jpg','images/formulated/card-open-door.jpg'),
 '5abad6c63c2639e46ddbf25a3f85b974':('players/banner-ember-v2.jpg','images/formulated/banner-every-song.jpg'),
 'a5aa4dd01940f5449a32e0a24e4b9945':('audio/2026-10-11-steadfast-february.mp4','audio/2026-10-11-steadfast-february.m4a'),
 'f9ef63466bf207d297f459b9a16cfd6d':('audio/2026-10-04-alive-chain.mp4','audio/2026-10-04-alive-chain.m4a'),
 '9ce065116ba55f9a34c2c57cc3366476':('audio/2026-09-27-clever-tortoise.mp4','audio/2026-09-27-clever-tortoise.m4a'),
 'e4a2896edb128f66543ffd5e8b82e19b':('audio/2026-09-27-chivalrous-stinger.mp4','audio/2026-09-27-chivalrous-stinger.m4a'),
 'ff061075d60dacd9b15593deca31f276':('audio/2026-09-20-rare-walk.mp4','audio/2026-09-20-rare-walk.m4a'),
 '6fa493f5e60c23cb3975eb6b62237ab2':('audio/2026-09-06-handsomely.mp4','audio/2026-09-06-handsomely.m4a'),
}
# Plates (the engraved artwork) are published smaller, signed with a small wordmark
# and tagged with copyright metadata. Print files never go on the website.
PLATE_DIRS=('images/plates/','images/formulated/','images/collected/plate-')
PLATE_MAX=1200
NOTICE='(c) 2026 brodband productions. Original artwork; reproduction not permitted.'
def _exif(im):
    ex=im.getexif(); ex[0x8298]=NOTICE; ex[0x013B]='brodband productions'; ex[0x010E]='Original engraved plate by brodband productions'; return ex
def _sign(im):
    mark=Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'signature-mark.png')).convert('RGBA')
    w=max(60,round(im.width*0.055)); mark=mark.resize((w,round(mark.height*w/mark.width)),Image.LANCZOS)
    a=mark.split()[3].point(lambda v:int(v*0.8)); mark.putalpha(a)
    from PIL import ImageFilter
    pad=round(im.width*0.018); base=im.convert('RGBA')
    m=max(4,w//10); sh=Image.new('RGBA',(mark.width+2*m,mark.height+2*m),(0,0,0,0))
    alpha=Image.new('L',sh.size,0); alpha.paste(mark.split()[3].point(lambda v:255 if v>0 else 0),(m,m))
    alpha=alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(m*0.6)).point(lambda v:int(v*0.85))
    sh.putalpha(alpha); x,y=im.width-w-pad,im.height-mark.height-pad
    base.alpha_composite(sh,(x-m,y-m)); base.alpha_composite(mark,(x,y)); return base.convert('RGB')
def copy_all():
    for bid,(src,dst) in M.items():
        o=OUT+dst; os.makedirs(os.path.dirname(o),exist_ok=True)
        if not os.path.exists(S+src):
            if os.path.exists(o): continue
            raise FileNotFoundError(src)
        if dst.endswith('.jpg'):
            im=Image.open(S+src).convert('RGB')
            plate=dst.startswith(PLATE_DIRS)
            mx=PLATE_MAX if plate else 1600
            if im.width>mx: im=im.resize((mx,round(im.height*mx/im.width)),Image.LANCZOS)
            if plate: im=_sign(im)
            im.save(o,quality=78 if plate else 82,optimize=True,progressive=True,exif=_exif(im))
        else:
            shutil.copyfile(S+src,o)
    return {k:'/'+v[1] for k,v in M.items()}
if __name__=='__main__':
    m=copy_all(); print(len(m),'assets')
