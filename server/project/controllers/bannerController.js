const pool = require("../config/db");
const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();
const BUCKET_NAME = "promocode-bot";
const ACCOUNT_ID = "1cca0fd4229edd2f754cea70c400023c";
const ACCESS_KEY_ID = "732ffc7219a6f1e1797f6d5ead9fad61";
const SECRET_ACCESS_KEY =
  "ae879174e5c16a53f8ff662dc544fd35b77c0fc10f949834fb339836ada7ff3b";
const PUBLIC_URL = "https://mediafiles.promocode888starzbot.site";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const createTemplate = async (req, res) => {
  const client = await pool.connect();
  try {
    const { geo, languages, type, size, tags, date_from, date_to } = req.body;
    const tagsParse = JSON.parse(tags);

    if (!req.file) {
      throw new Error("Файл не передан в запросе");
    }

    if (!req.file.buffer) {
      throw new Error(
        "Buffer is undefined. Multer may not be configured correctly."
      );
    }

    await client.query("BEGIN");

    const fileKey = `${Date.now()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ContentLength: req.file.buffer.length,
      ACL: "public-read",
    };

    await S3.send(new PutObjectCommand(uploadParams));
    const imageUrl = `${PUBLIC_URL}/${fileKey}`;

    const bannerResult = await client.query(
      `INSERT INTO banners 
    (geo, language, type, size, url, name, date_from, date_to) 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
   RETURNING id`,
      [
        geo,
        languages,
        type,
        size,
        imageUrl,
        fileKey,
        date_from || null,
        date_to || null,
      ]
    );

    const bannerId = bannerResult.rows[0].id;

    if (tagsParse && tagsParse.length > 0) {
      const tagInserts = tagsParse.map((tagId) =>
        client.query(
          "INSERT INTO banner_tag (banner_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [bannerId, tagId]
        )
      );
      await Promise.all(tagInserts);
    }

    await client.query("COMMIT");
    res.json({ message: "Баннер создан!", bannerId, imageUrl });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка сервера:", err.message);
    res.status(500).send("Ошибка сервера: " + err.message);
  } finally {
    client.release();
  }
};

const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Запрос на баннер с ID: ${id}`);

    const bannerResult = await pool.query(
      "SELECT * FROM banners WHERE id = $1",
      [id]
    );
    if (bannerResult.rows.length === 0) {
      console.log(`Баннер с ID ${id} не найден`);
      return res.status(404).json({ message: "Баннер не найден" });
    }
    const banner = bannerResult.rows[0];
    console.log(`Баннер найден: ${JSON.stringify(banner)}`);

    const tagsResult = await pool.query(
      "SELECT t.id, t.name FROM tags t JOIN banner_tag bt ON t.id = bt.tag_id WHERE bt.banner_id = $1",
      [id]
    );
    console.log(`Теги для баннера ${id}: ${JSON.stringify(tagsResult.rows)}`);

    const s3Response = await S3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: banner.name, // Имя файла в S3
      })
    );
    console.log(`Файл найден в S3 с ключом: ${banner.name}`);

    const fileData = await s3Response.Body.transformToString();
    console.log(`Данные файла получены`);

    res.json({
      id: banner.id,
      url: banner.url,
      geo: banner.geo,
      language: banner.language,
      size: banner.size,
      type: banner.type,
      tags: tagsResult.rows,
      date_from: banner.date_from,
      date_to: banner.date_to,
      fileData,
    });
  } catch (err) {
    console.error("Ошибка при получении баннера:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

const getTemplates = async (req, res) => {
  try {
    const { tags, type, size, language, page = 1, limit = 10 } = req.query;
    let query = `
      SELECT 
        banners.*, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', tags.id, 'name', tags.name)) FILTER (WHERE tags.id IS NOT NULL), '[]') AS tags
      FROM banners
      LEFT JOIN banner_tag ON banners.id = banner_tag.banner_id
      LEFT JOIN tags ON banner_tag.tag_id = tags.id
      WHERE 1=1
    `;
    let params = [];

    query += " AND (banners.date_to IS NULL OR banners.date_to >= NOW())";

    if (type) {
      query += " AND banners.type = $" + (params.length + 1);
      params.push(type);
    }
    if (size) {
      query += " AND banners.size = $" + (params.length + 1);
      params.push(size);
    }
    if (language) {
      query += " AND banners.language ILIKE $" + (params.length + 1);
      params.push(language);
    }
    if (tags) {
      const tagArray = tags.split(",").map((tag) => parseInt(tag, 10));
      if (tagArray.length > 0) {
        const placeholders = tagArray.map(
          (_, index) => `$${params.length + index + 1}`
        );
        query += ` AND banner_tag.tag_id IN (${placeholders.join(", ")})`;
        params.push(...tagArray);
        query += ` GROUP BY banners.id HAVING COUNT(DISTINCT banner_tag.tag_id) = ${tagArray.length}`;
      }
    } else {
      query += " GROUP BY banners.id";
    }

    query += " ORDER BY banners.id DESC";
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(DISTINCT banners.id) AS count
      FROM banners
      LEFT JOIN banner_tag ON banners.id = banner_tag.banner_id
      LEFT JOIN tags ON banner_tag.tag_id = tags.id
      WHERE 1=1
      AND (banners.date_to IS NULL OR banners.date_to >= NOW())
    `;
    let countParams = [];

    if (type) {
      countQuery += " AND banners.type = $" + (countParams.length + 1);
      countParams.push(type);
    }
    if (size) {
      countQuery += " AND banners.size = $" + (countParams.length + 1);
      countParams.push(size);
    }
    if (language) {
      countQuery += " AND banners.language ILIKE $" + (countParams.length + 1);
      countParams.push(language);
    }
    if (tags) {
      const tagArray = tags.split(",").map((tag) => parseInt(tag, 10));
      if (tagArray.length > 0) {
        const placeholders = tagArray.map(
          (_, index) => `$${countParams.length + index + 1}`
        );
        countQuery += ` AND banner_tag.tag_id IN (${placeholders.join(", ")})`;
        countParams.push(...tagArray);
        countQuery += ` GROUP BY banners.id HAVING COUNT(DISTINCT banner_tag.tag_id) = ${tagArray.length}`;
      }
    }

    const totalCountResult = await pool.query(countQuery, countParams);

    const totalCount =
      totalCountResult.rows.length > 0 ? totalCountResult.rows[0].count : 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: result.rows,
      totalPages,
    });
  } catch (err) {
    console.error("Ошибка сервера:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

const deleteTemplate = async (req, res) => {
  const client = await pool.connect();
  try {
    const { bannerId } = req.params;

    await client.query("BEGIN");

    const bannerResult = await client.query(
      "SELECT name FROM banners WHERE id = $1",
      [bannerId]
    );

    if (bannerResult.rows.length === 0) {
      throw new Error("Баннер не найден");
    }

    const fileKey = bannerResult.rows[0].name;

    await client.query("DELETE FROM banner_tag WHERE banner_id = $1", [
      bannerId,
    ]);

    await client.query("DELETE FROM banners WHERE id = $1", [bannerId]);

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
    };

    await S3.send(new DeleteObjectCommand(deleteParams));

    await client.query("COMMIT");
    res.json({ message: "Баннер удален!" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка сервера:", err.message);
    res.status(500).send("Ошибка сервера: " + err.message);
  } finally {
    client.release();
  }
};

const updateTemplate = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { geo, languages, type, size, tags, date_from, date_to } = req.body;
    const tagsParse = tags ? JSON.parse(tags) : undefined;

    const existingBanner = await client.query(
      "SELECT id, name FROM banners WHERE id = $1",
      [id]
    );

    if (existingBanner.rows.length === 0) {
      return res.status(404).json({ message: "Баннер не найден" });
    }

    const bannerId = existingBanner.rows[0].id;

    await client.query("BEGIN");

    let updateQuery = "UPDATE banners SET ";
    const params = [];
    let paramIndex = 1;

    if (geo !== undefined) {
      updateQuery += `geo = $${paramIndex}, `;
      params.push(geo);
      paramIndex++;
    }
    if (languages !== undefined) {
      updateQuery += `language = $${paramIndex}, `;
      params.push(languages);
      paramIndex++;
    }
    if (type !== undefined) {
      updateQuery += `type = $${paramIndex}, `;
      params.push(type);
      paramIndex++;
    }
    if (size !== undefined) {
      updateQuery += `size = $${paramIndex}, `;
      params.push(size);
      paramIndex++;
    }
    if (date_from !== undefined) {
      updateQuery += `date_from = $${paramIndex}, `;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to !== undefined) {
      updateQuery += `date_to = $${paramIndex}, `;
      params.push(date_to);
      paramIndex++;
    }

    if (paramIndex > 1) {
      updateQuery = updateQuery.slice(0, -2); // Удаляем лишнюю запятую и пробел
      updateQuery += ` WHERE id = $${paramIndex}`;
      params.push(bannerId);
      await client.query(updateQuery, params);
    }

    if (tagsParse !== undefined) {
      await client.query("DELETE FROM banner_tag WHERE banner_id = $1", [
        bannerId,
      ]);
      if (tagsParse.length > 0) {
        const tagInserts = tagsParse.map((tagId) =>
          client.query(
            "INSERT INTO banner_tag (banner_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [bannerId, tagId]
          )
        );
        await Promise.all(tagInserts);
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Баннер обновлён!", bannerId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Server error:", err.message);
    res.status(500).send("Ошибка сервера");
  } finally {
    client.release();
  }
};

const getTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT type FROM banners");
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении типов:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Получение уникальных размеров баннеров
const getSizes = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT size FROM banners");
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении размеров:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

const incrementDownloadCount = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const updateResult = await client.query(
      `
      UPDATE banners 
      SET download_count = COALESCE(download_count, 0) + 1 
      WHERE id = $1 
      RETURNING id, download_count
      `,
      [id]
    );

    if (updateResult.rows.length === 0) {
      throw new Error("Баннер не найден");
    }

    const updatedBanner = updateResult.rows[0];

    await client.query("COMMIT");

    res.json({
      message: "Счетчик скачиваний увеличен",
      bannerId: updatedBanner.id,
      downloadCount: updatedBanner.download_count,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка при увеличении счетчика:", err.message);
    res.status(404).send("Ошибка: " + err.message);
  } finally {
    client.release();
  }
};

const getFiltersOptions = async (req, res) => {
  const client = await pool.connect();
  try {
    // Получаем уникальные значения для каждого поля
    const sizesQuery = await client.query(
      "SELECT DISTINCT size FROM banners WHERE size IS NOT NULL ORDER BY size"
    );
    const typesQuery = await client.query(
      "SELECT DISTINCT type FROM banners WHERE type IS NOT NULL ORDER BY type"
    );
    const languagesQuery = await client.query(
      "SELECT DISTINCT language FROM banners WHERE language IS NOT NULL ORDER BY language"
    );
    const tagsQuery = await client.query(`
      SELECT DISTINCT t.id, t.name 
      FROM tags t
      JOIN banner_tag bt ON t.id = bt.tag_id
      ORDER BY t.name
    `);

    const filtersOptions = {
      sizes: sizesQuery.rows.map((row) => ({
        name: row.size,
        value: row.size,
      })),
      types: typesQuery.rows.map((row) => ({
        name: row.type,
        value: row.type,
      })),
      languages: languagesQuery.rows.map((row) => ({
        name: row.language,
        value: row.language,
      })),
      tags: tagsQuery.rows.map((row) => ({
        id: row.id,
        name: row.name,
        value: row.id,
      })),
    };

    res.json(filtersOptions);
  } catch (err) {
    console.error("Ошибка при получении опций фильтров:", err.message);
    res.status(500).send("Ошибка сервера");
  } finally {
    client.release();
  }
};

module.exports = {
  getTemplates,
  deleteTemplate,
  createTemplate,
  updateTemplate,
  getTemplateById,
  getTypes,
  getSizes,
  incrementDownloadCount,
  getFiltersOptions,
};
