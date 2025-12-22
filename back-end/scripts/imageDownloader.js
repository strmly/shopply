// Image Downloader Utility
// Downloads product images from URLs and saves them to local storage

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

class ImageDownloader {
  constructor(outputDir = './public/images/products') {
    this.outputDir = outputDir;
    this.ensureDirectoryExists(this.outputDir);
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }

  /**
   * Download a single image from URL
   * @param {string} imageUrl - URL of the image
   * @param {string} filename - Desired filename
   * @returns {Promise<string>} - Path to the downloaded image
   */
  async downloadImage(imageUrl, filename) {
    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(imageUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const filepath = path.join(this.outputDir, filename);
        const dirname = path.dirname(filepath);
        
        this.ensureDirectoryExists(dirname);

        const file = fs.createWriteStream(filepath);

        protocol.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(filepath, () => {});
            reject(new Error(`Failed: ${response.statusCode}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            console.log(`✅ ${filename}`);
            resolve(filepath);
          });

          file.on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {});
            reject(err);
          });
        }).on('error', (err) => {
          file.close();
          fs.unlink(filepath, () => {});
          reject(err);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download multiple images for a product
   */
  async downloadProductImages(product, productId) {
    const images = [];
    let mainImage = null;

    try {
      // Download main image
      if (product.imageUrl) {
        const ext = this.getImageExtension(product.imageUrl);
        const filename = `${productId}/main${ext}`;
        const filepath = await this.downloadImage(product.imageUrl, filename);
        mainImage = filepath.replace(this.outputDir, '').replace(/^\//, '');
      }

      // Download additional images
      if (product.images && Array.isArray(product.images)) {
        for (let i = 0; i < product.images.length; i++) {
          const ext = this.getImageExtension(product.images[i]);
          const filename = `${productId}/image-${i + 1}${ext}`;
          
          try {
            const filepath = await this.downloadImage(product.images[i], filename);
            images.push(filepath.replace(this.outputDir, '').replace(/^\//, ''));
          } catch (error) {
            console.warn(`⚠️  Image ${i + 1} failed for product ${productId}`);
          }
        }
      }

      return {
        ...product,
        imageUrl: mainImage || images[0] || null,
        images: images,
        originalImageUrl: product.imageUrl,
        originalImages: product.images
      };

    } catch (error) {
      console.error(`❌ Product ${productId}:`, error.message);
      return product;
    }
  }

  getImageExtension(url) {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i);
    return match ? `.${match[1].toLowerCase()}` : '.jpg';
  }

  /**
   * Download all images for an array of products
   */
  async downloadAllProducts(products) {
    const updatedProducts = [];
    
    console.log(`\n📥 Downloading images for ${products.length} products...\n`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] ${product.name}`);

      const updatedProduct = await this.downloadProductImages(product, product.id);
      updatedProducts.push(updatedProduct);

      // Delay to avoid overwhelming servers
      await this.delay(100);
    }

    console.log(`\n✅ Complete! ${updatedProducts.length} products processed.\n`);
    return updatedProducts;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveToJSON(products, filename = 'products-with-local-images.json') {
    const outputPath = path.join(process.cwd(), filename);
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log(`💾 Saved: ${outputPath}`);
    return outputPath;
  }
}

export default ImageDownloader;

