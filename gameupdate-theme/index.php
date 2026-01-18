<?php get_header(); ?>
<h2>Berita Game Terbaru</h2>
<?php while(have_posts()): the_post(); ?>
<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
<?php endwhile; ?>
<?php get_footer(); ?>
