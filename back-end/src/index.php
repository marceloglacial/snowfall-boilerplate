<!DOCTYPE html>
<html lang="en">

<head>
    <noscript>
        <div class="alert alert-danger" role="alert">
            You need to enable JavaScript to run this app.
        </div>
    </noscript>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="index, follow">

    <!-- Viewport for responsive web design -->
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

    <!-- Pre-loads -->
    <link rel="preload" href="<?php bloginfo('template_url'); ?>/css/main.min.css" as="style" />
    <link rel="preload" href="<?php bloginfo('template_url'); ?>/js/main.min.js" as="script" />

    <!-- INFO -->
    <title><?php bloginfo('name'); ?></title>
    <meta name="description" content="<?php bloginfo('description'); ?>"
    />
    <meta name="keywords" content="<?php bloginfo('name'); ?>, <?php bloginfo('description'); ?>" />

    <!-- Recommended favicon format -->
    <link rel="icon" type="image/png" href="<?php bloginfo('template_url'); ?>/favicon.png">

    <!-- Apple Touch Icon (at least 200x200px) -->
    <link rel="apple-touch-icon" href="<?php bloginfo('template_url'); ?>/tile.png">

    <!-- To run web application in full-screen -->
    <meta name="apple-mobile-web-app-capable" content="yes">

    <!-- Status Bar Style (see Supported Meta Tags below for available values) -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black">

    <!-- Microsoft Tiles -->
    <meta name="msapplication-config" content="<?php bloginfo('template_url'); ?>/browserconfig.xml" />

    <!-- SOCIAL -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php bloginfo('template_url'); ?>">
    <meta property="og:title" content="<?php bloginfo('name'); ?>">
    <meta property="og:image" content="<?php bloginfo('template_url'); ?>/tile-wide.png">
    <meta property="og:description" content="<?php bloginfo('description'); ?>">
    <meta property="og:site_name" content="<?php bloginfo('name'); ?>">
    <meta property="og:locale" content="en_US">

    <!-- STYLES -->
    <link rel="stylesheet preload prefetch" href="<?php bloginfo('template_url'); ?>/css/main.min.css?v=1.0.1" as='style'>

    <?php wp_head(); ?> 
</head>

<body>
    <div id="wrapper" class="container-fluid">
        <header>
            <h1><?php bloginfo('name'); ?></h1>
        </header>
        <main>
            <!-- START THE LOOP -->
            <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <h2>
                    <a href="<?php the_permalink(); ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
                        <?php the_title(); ?>
                    </a>
                </h2>

                <small>
                    <?php the_time('F jS, Y'); ?> by
                    <?php the_author_posts_link(); ?>
                </small>


                <div class="entry">
                    <?php the_content(); ?>
                </div>

                <?php endwhile; else : ?>
                <p>
                    <?php esc_html_e( 'Sorry, no posts matched your criteria.' ); ?>
                </p>
                <!-- STOP THE LOOP -->
                <?php endif; ?>
        </main>
        
    </div>
    <!-- /WRAPPER -->

    <!-- SCRIPTS -->
    <script async src="<?php bloginfo('template_url'); ?>/js/main.min.js"></script>
    <?php wp_footer(); ?>
</body>

</html>
