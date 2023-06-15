(() => {
	'use strict';
	var e = {
			4235: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }), r(1081);
				const a = s(r(3511)),
					n = r(8117),
					u = s(r(7130));
				function s(e) {
					return e && e.__esModule ? e : { default: e };
				}
				a.default.use(
					new n.Strategy(
						{
							clientID: process.env.GOOGLE_CLIENT_ID,
							clientSecret: process.env.GOOGLE_CLIENT_SECRET,
							callbackURL: '/api/auth/google/callback',
							passReqToCallback: !0
						},
						function (e, t, r, a, n) {
							u.default.findOne({ email: a.email }).exec((e, t) => {
								if ((console.log(t), e)) return n(e, !1);
								if (!t) return n(null, !1);
								let r = t?.picture || a.picture;
								return n(null, { ...t?.toObject(), picture: r });
							});
						}
					)
				),
					a.default.serializeUser((e, t) => t(null, e)),
					a.default.deserializeUser((e, t) => t(null, e));
			},
			3671: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 });
				const a = r(7055),
					n = s(r(3511)),
					u = s(r(7130));
				function s(e) {
					return e && e.__esModule ? e : { default: e };
				}
				n.default.use(
					new a.Strategy({ usernameField: 'email', passReqToCallback: !0 }, function (e, t, r, a) {
						u.default.findOne({ phone: t }, function (e, t) {
							return e ? a(e) : t && t.verifyPassword(r) ? a(null, t) : a(null, !1);
						});
					})
				),
					n.default.serializeUser((e, t) => t(null, e)),
					n.default.deserializeUser((e, t) => t(null, e));
			},
			5355: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						signinWithGoogle: function () {
							return O;
						},
						signinWithPhoneNumber: function () {
							return b;
						},
						getUser: function () {
							return _;
						},
						refreshToken: function () {
							return w;
						},
						signout: function () {
							return E;
						},
						verifyAccount: function () {
							return j;
						},
						sendOtp: function () {
							return T;
						},
						verifyUserByPhone: function () {
							return S;
						},
						resetPassword: function () {
							return v;
						}
					}),
					r(1081);
				const a = g(r(8931)),
					n = g(r(9344)),
					u = g(r(1017)),
					s = g(r(2057)),
					o = r(1548),
					i = g(r(9123)),
					d = g(r(2076)),
					l = g(r(1261)),
					c = r(2116),
					f = r(3111),
					p = r(6880);
				r(4235);
				const y = g(r(7130)),
					h = g(r(4128)),
					m = r(3019);
				function g(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const O = async (e, t) => {
						try {
							let r = e.user;
							if (!r) return t.redirect(s.default.CLIENT_URL + '/signin');
							let a = n.default.sign({ payload: e.user }, process.env.ACCESS_TOKEN_SECRET, {
									expiresIn: '1h'
								}),
								u = n.default.sign({ payload: e.user }, process.env.REFRESH_TOKEN_SECRET, {
									expiresIn: '30d'
								});
							return (
								await Promise.all([
									i.default.set(f.AuthRedisKeyPrefix.ACCESS_TOKEN + r._id, a, {
										EX: 3600
									}),
									i.default.set(f.AuthRedisKeyPrefix.REFRESH_TOKEN + r._id, u, {
										EX: 2592e3
									})
								]),
								t.cookie('access_token', a, {
									maxAge: 31536e6,
									httpOnly: !0
								}),
								t.cookie('uid', r?._id?.toString().trim(), {
									maxAge: 2592e6,
									httpOnly: !0
								}),
								t.redirect(s.default.CLIENT_URL + '/signin/success')
							);
						} catch (e) {
							let r = new c.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					b = async (e, t) => {
						try {
							let r = e.user,
								a = n.default.sign({ payload: r }, process.env.ACCESS_TOKEN_SECRET, {
									expiresIn: '1h'
								}),
								u = n.default.sign({ payload: r }, process.env.REFRESH_TOKEN_SECRET, {
									expiresIn: '30d'
								});
							return (
								await Promise.all([
									i.default.set(f.AuthRedisKeyPrefix.ACCESS_TOKEN + r._id, a, {
										EX: 3600
									}),
									i.default.set(f.AuthRedisKeyPrefix.REFRESH_TOKEN + r._id, u, {
										EX: 2592e3
									})
								]),
								t.cookie('access_token', a, {
									maxAge: 31536e6,
									httpOnly: !0
								}),
								t.cookie('uid', r?._id?.toString().trim(), {
									maxAge: 31536e6,
									httpOnly: !0
								}),
								t.status(o.HttpStatusCode.OK).json({ user: e.user, accessToken: a })
							);
						} catch (e) {
							return t.status(e.statusCode || 500).json({
								message: e.message,
								statusCode: e.status || 500
							});
						}
					},
					_ = async (e, t) => {
						try {
							if (!e.profile) throw a.default.NotFound("Failed to get user's info");
							return t.status(o.HttpStatusCode.OK).json(e.profile);
						} catch (e) {
							let r = new c.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					w = async (e, t) => {
						try {
							let r = await i.default.get(f.AuthRedisKeyPrefix.REFRESH_TOKEN + e.cookies.uid);
							if (!r) throw a.default.BadRequest('Invalid refresh token!');
							let u = n.default.verify(r, process.env.REFRESH_TOKEN_SECRET);
							if (!u.payload) throw a.default.Forbidden('Invalid token payload');
							let s = n.default.sign(u.payload, process.env.ACCESS_TOKEN_SECRET, {
								expiresIn: '30m'
							});
							return (
								await i.default.set(f.AuthRedisKeyPrefix.ACCESS_TOKEN + e.cookies.uid, s, {
									EX: 3600
								}),
								t.cookie('access_token', s, {
									maxAge: 31536e6,
									httpOnly: !0
								}),
								t.status(o.HttpStatusCode.OK).json({
									refreshToken: s,
									statusCode: o.HttpStatusCode.OK,
									message: 'ok'
								})
							);
						} catch (e) {
							return t.status(e.statusCode || 500).json({
								message: e.message,
								statusCode: e.status || 500
							});
						}
					},
					E = async (e, t) => {
						try {
							let r = {
								accessToken: f.AuthRedisKeyPrefix.ACCESS_TOKEN + e.profile._id,
								refreshToken: f.AuthRedisKeyPrefix.REFRESH_TOKEN + e.profile._id
							};
							return (await i.default.get(r.accessToken))
								? (await Promise.all([i.default.del(r.accessToken), i.default.del(r.refreshToken)]),
								  e.logout((e) => {
										if (e) throw e;
								  }),
								  t.clearCookie('access_token'),
								  t.clearCookie('uid'),
								  t.clearCookie('connect.sid', { path: '/' }),
								  t.status(202).json({
										message: 'Signed out!',
										statusCode: 202
								  }))
								: t.status(400).json({
										message: 'Failed to revoke token',
										statusCode: 400
								  });
						} catch (e) {
							return t.status(e.status || 500).json({
								message: 'Không thể đăng xuất',
								statusCode: e.status || 500
							});
						}
					},
					j = async (e, t) => {
						try {
							let r = e.query.token;
							if (!r) throw a.default.Unauthorized('Access token must be provided!');
							let { auth: s } = n.default.verify(r, process.env.ACCESS_TOKEN_SECRET),
								o =
									e.query.user_type === p.UserRoleEnum.TEACHER
										? { isVerified: !0, employmentStatus: !0 }
										: { isVerified: !0 };
							return (
								await y.default.findOneAndUpdate({ email: s }, o, {
									new: !0
								}),
								t.setHeader(
									'Content-Security-Policy',
									"script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com"
								),
								t.setHeader('Cross-origin-Embedder-Policy', 'same-origin'),
								t.setHeader('Access-Control-Allow-Origin', '*'),
								t.sendFile(u.default.resolve(u.default.join(__dirname, '../views/send-mail-response.html')))
							);
						} catch (e) {
							return t.status(e.statusCode || 500).json({ message: e.message, statusCode: e.status });
						}
					},
					T = async (e, t) => {
						try {
							let r = await y.default.findOne({ phone: e.body.phone });
							if (!r) throw a.default.NotFound("User's phone number does not exist!");
							let n = (0, l.default)();
							await i.default.set(f.AuthRedisKeyPrefix.OTP_KEY + r._id, n, { EX: 3600 }),
								console.log('OTP is ', n);
							let u = await (0, h.default)({
								to: (0, d.default)(e.body.phone),
								text: `Mã xác thực của bạn là ${n}`
							});
							if (!u) throw a.default.InternalServerError('Failed to send sms!');
							return t.status(o.HttpStatusCode.OK).json(u);
						} catch (e) {
							return t.status(e.status || 500).json({ message: e.message, statusCode: e.status });
						}
					},
					S = async (e, t) => {
						try {
							if (!e.body.verifyCode) throw a.default.BadRequest('Verify code must be provided!');
							let r = await i.default.get(f.AuthRedisKeyPrefix.OTP_KEY + e.params.userId);
							if (!r) throw a.default.Gone('Code is expired!');
							if (e.body.verifyCode !== r)
								return t.status(400).json({
									message: 'Incorrect verify code!',
									statusCode: 400
								});
							let u = n.default.sign({ payload: e.params.userId }, process.env.ACCESS_TOKEN_SECRET, {
								expiresIn: '5m'
							});
							return (
								t.cookie('access_token', u, { maxAge: 3e5 }),
								await i.default.del(f.AuthRedisKeyPrefix.OTP_KEY + e.params.userId),
								t.status(o.HttpStatusCode.OK).json({
									message: 'Ok',
									statusCode: o.HttpStatusCode.OK,
									data: { accessToken: u, isSuccess: !0 }
								})
							);
						} catch (e) {
							return t.status(e.status || 500).json({ message: e.message, statusCode: e.status });
						}
					},
					v = async (e, t) => {
						try {
							if (!e.cookies.access_token) throw a.default.Unauthorized('');
							let r = n.default.verify(e.cookies.access_token, process.env.ACCESS_TOKEN_SECRET);
							return (
								await (0, m.changePassword)(r.payload, e.body.newPassword),
								t.status(o.HttpStatusCode.OK).json({
									message: 'Ok',
									statusCode: o.HttpStatusCode.OK
								})
							);
						} catch (e) {
							return t.status(e.status || 500).json({ message: e.message, statusCode: e.status });
						}
					};
			},
			9105: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createClass: function () {
							return c;
						},
						updateClass: function () {
							return f;
						},
						removeClass: function () {
							return p;
						},
						restoreClass: function () {
							return y;
						},
						getClasses: function () {
							return h;
						},
						getClassOne: function () {
							return m;
						},
						getClassTrash: function () {
							return g;
						}
					});
				const a = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = l(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(4923)),
					n = d(r(8931)),
					u = d(r(1185)),
					s = r(2116),
					o = d(r(3562)),
					i = r(1548);
				function d(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function l(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (l = function (e) {
						return e ? r : t;
					})(e);
				}
				const c = async (e, t) => {
						try {
							let { classes: r } = await a.createClass(e.body);
							return t.status(i.HttpStatusCode.CREATED).json(r);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t) => {
						try {
							let r = e.params.id,
								n = e.body,
								u = await a.updateClasses(n, r);
							return t.status(i.HttpStatusCode.CREATED).json(u);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t) => {
						try {
							let r,
								u = e.params.id,
								s = e.query.option || 'soft';
							if (!u) throw (0, n.default)(i.HttpStatusCode.NO_CONTENT);
							switch (s) {
								case 'soft':
									r = await a.softDeleteClass(u);
									break;
								case 'force':
									r = await a.forceDeleteClass(u);
									break;
								default:
									throw n.default.InternalServerError('InternalServerError');
							}
							return t.status(r.statusCode).json(r);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					y = async (e, t) => {
						try {
							let r = e.params.id;
							if (!r || !u.default.Types.ObjectId.isValid(r))
								throw n.default.BadRequest('id must type must be object id, id received:' + r);
							let s = await a.restoreClass(r);
							return t.status(i.HttpStatusCode.CREATED).json(s);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					h = async (e, t) => {
						try {
							let r = e.query._sort?.toString() || 'grade',
								a = 'desc' === e.query._order ? 1 : -1;
							if (!['className', 'grade', 'createdAt', 'updatedAt'].includes(r))
								throw n.default.BadRequest(
									"_sort can only belong to ['className', 'grade','createdAt','updatedAt']"
								);
							let u = await o.default.find().sort({ [r]: a });
							return t.status(i.HttpStatusCode.OK).json(u);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					m = async (e, t) => {
						try {
							let r = e.params.id;
							if (!r || !u.default.Types.ObjectId.isValid(r)) throw n.default.BadRequest('Missing parameter');
							let a = await o.default.findOne({ _id: r });
							if (!a) throw n.default.NotFound('Class not found');
							return t.status(i.HttpStatusCode.OK).json(a);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					g = async (e, t) => {
						try {
							let e = await o.default.findWithDeleted({ deleted: !0 });
							return t.status(i.HttpStatusCode.OK).json(e);
						} catch (e) {
							let r = new s.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			6886: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						getFiles: function () {
							return f;
						},
						uploadFile: function () {
							return p;
						},
						updateFile: function () {
							return y;
						},
						deleteFile: function () {
							return h;
						},
						restoreFile: function () {
							return m;
						}
					}),
					r(1081);
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = r(2407),
					u = c(r(6954)),
					s = c(r(4720)),
					o = r(7848),
					i = r(2116),
					d = r(1548);
				function l(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (l = function (e) {
						return e ? r : t;
					})(e);
				}
				function c(e, t) {
					if (!t && e && e.__esModule) return e;
					if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
					var r = l(t);
					if (r && r.has(e)) return r.get(e);
					var a = {},
						n = Object.defineProperty && Object.getOwnPropertyDescriptor;
					for (var u in e)
						if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
							var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
							s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
						}
					return (a.default = e), r && r.set(e, a), a;
				}
				const f = async (e, t) => {
						try {
							let r = (0, n.multiFieldSortObjectParser)({
									_sort: e.query._sort,
									_order: e.query.order
								}),
								a = {
									limit: +e.query._limit || 20,
									page: +e.query._page,
									sort: r || {}
								};
							if (e.query.grade || e.query.subject) {
								let r = await s.getFiles({ subject: e.query.subject, grade: e.query.grade }, a);
								return t.status(d.HttpStatusCode.OK).json(r);
							}
							{
								let e = await s.getFiles({ deleted: !1 }, a);
								return t.status(d.HttpStatusCode.OK).json(e);
							}
						} catch (e) {
							let r = new i.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t) => {
						try {
							let [r] = e.files;
							if (!r) throw a.default.BadRequest('File must be provided!');
							if (!(0, o.checkValidMimeType)(r))
								throw a.default.UnprocessableEntity('File type is not allowed to upload!');
							let n = await u.uploadFile(r, process.env.FOLDER_ID),
								i = {
									fileId: n?.data.id,
									fileName: r.originalname,
									mimeType: r.mimetype,
									subject: e.body.subject,
									grade: +e.body.grade
								},
								l = await s.saveFile(i);
							return t.status(d.HttpStatusCode.CREATED).json(l);
						} catch (e) {
							return t.status(e.status || 500).json({
								message: e.message,
								statusCode: e.status || 400
							});
						}
					},
					y = async (e, t) => {
						try {
							let r = await s.updateFile(e.params.fileId, e.body);
							return t.status(d.HttpStatusCode.CREATED).json(r);
						} catch (e) {
							let r = new i.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					h = async (e, t) => {
						try {
							if (e.query.hard_delete) {
								let r = await s.hardDeleteFile(e.params.fileId),
									a = await u.deleteFile(e.params.fileId);
								return t.status(d.HttpStatusCode.NO_CONTENT).json({ deletedFile: a, deletedFileInDb: r });
							}
							{
								let r = await s.softDeleteFile(e.params.fileId);
								return t.status(d.HttpStatusCode.NO_CONTENT).json(r);
							}
						} catch (e) {
							console.log(e.message);
							let r = new i.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					m = async (e, t) => {
						try {
							let r = await s.restoreDeletedFile(e.params.fileId);
							return t.status(d.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new i.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			3750: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						read: function () {
							return c;
						},
						create: function () {
							return f;
						},
						remove: function () {
							return p;
						},
						restore: function () {
							return y;
						},
						update: function () {
							return h;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = r(1185),
					u = r(2116),
					s = r(6880),
					o = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = l(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(7273)),
					i = r(8719),
					d = r(1548);
				function l(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (l = function (e) {
						return e ? r : t;
					})(e);
				}
				const c = async (e, t) => {
						try {
							let r = e.query.role;
							if (!r) throw a.default.BadRequest('Missing parameter: role');
							if (!Object.values(s.UserRoleEnum).includes(r))
								throw a.default.BadRequest(
									`User's role parameter must be one of these: ${Object.values(s.UserRoleEnum)}`
								);
							let n = await o.getPermissionByRole(r);
							if (!n) throw a.default.NotFound('Permission not found');
							return t.status(d.HttpStatusCode.OK).json(n);
						} catch (e) {
							console.log(e);
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t) => {
						try {
							let { error: r } = (0, i.validatePermissionData)(e.body);
							if (r) throw a.default.BadRequest(r.message);
							let n = await o.createPermission(e.body);
							if (!n) throw a.default.BadRequest('Permission not created!');
							return t.status(d.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t) => {
						let r;
						try {
							let { id: u } = e.params,
								s = e.query.option || 'soft';
							if (!(0, n.isValidObjectId)(u)) throw a.default.BadRequest('Invalid ID!');
							switch (s) {
								case 'soft':
									r = await o.deletePermission(u);
									break;
								case 'force':
									r = await o.forceDeletePermission(u);
									break;
								default:
									throw a.default.BadRequest('Invalid query');
							}
							return t.status(d.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					y = async (e, t) => {
						try {
							let r = e.params.id;
							if (!r || !(0, n.isValidObjectId)(r)) throw a.default.BadRequest('Invalid ID!');
							let u = await o.restoreDeletedPermission(r);
							if (!u) throw a.default.NotFound('Permission not found');
							return t.status(d.HttpStatusCode.CREATED).json(u);
						} catch (e) {
							return t.status(e.statusCode || 500).json({
								message: e.message,
								statusCode: e.status || 500
							});
						}
					},
					h = async (e, t) => {
						try {
							let { id: r } = e.params,
								u = e.body,
								{ error: s } = (0, i.validatePermissionData)(u);
							if (s) throw a.default.BadRequest(s.message);
							if (!r) throw a.default.BadRequest('Missing ID parameter');
							if (!(0, n.isValidObjectId)(r)) throw a.default.BadRequest('Invalid ID');
							if (!u) throw a.default.BadRequest('Missing data in request body');
							let l = await o.updatePermission(r, u);
							if (!l) throw a.default.NotFound('Permission not found');
							return t.status(d.HttpStatusCode.OK).json(l);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			1288: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						schoolYearList: function () {
							return o;
						},
						getCurrentYear: function () {
							return i;
						},
						createSchoolYear: function () {
							return d;
						}
					});
				const a = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(254)),
					n = r(1548),
					u = r(2116);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = async (e, t) => {
						try {
							let r = e.query.limit ? Number(e.query.limit) : 10,
								u = e.query.page ? Number(e.query.page) : 1,
								s = await a.getAllSchoolYear(r, u);
							return t.status(n.HttpStatusCode.OK).json(s);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					i = async (e, t) => {
						try {
							let e = await a.selectSchoolYearCurr();
							return t.status(200).json(e);
						} catch (e) {
							return t.status(e.statusCode || 500).json({
								message: e.message,
								statusCode: e.status || 500,
								error: e.error
							});
						}
					},
					d = async (e, t) => {
						try {
							let e = await a.createSchoolYear();
							return t.status(n.HttpStatusCode.CREATED).json(e);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			9732: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createStudent: function () {
							return d;
						},
						updateStudent: function () {
							return l;
						},
						getStudentByClass: function () {
							return c;
						},
						getStudentDetail: function () {
							return f;
						},
						serviceStudent: function () {
							return p;
						},
						getStudentStop: function () {
							return y;
						},
						attendanceStudentByClass: function () {
							return h;
						},
						selectAttendanceByClass: function () {
							return m;
						},
						selectAttendanceByStudent: function () {
							return g;
						},
						getPolicyBeneficiary: function () {
							return O;
						},
						selectAttendanceAllClass: function () {
							return b;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = r(7790),
					u = r(2116),
					s = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = i(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(4051)),
					o = r(1548);
				function i(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (i = function (e) {
						return e ? r : t;
					})(e);
				}
				const d = async (e, t) => {
						try {
							let r = await s.createStudent(e.body);
							return t.status(o.HttpStatusCode.CREATED).json(r);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					l = async (e, t) => {
						try {
							let r = e.params.id,
								a = e.body,
								n = await s.updateStudent(r, a);
							return t.status(o.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					c = async (e, t) => {
						try {
							let r = e.params.class,
								a = 'desc' === e.query._order ? 1 : -1,
								n = e.query._sort?.toString() || 'fullName',
								u = e.query.select?.toString() || '',
								i = await s.getStudentByClass(r, a, n, u);
							return t.status(o.HttpStatusCode.OK).json(i);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t) => {
						try {
							let r = e.params.id,
								a = await s.getDetailStudent(r);
							return t.status(o.HttpStatusCode.OK).json(a);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t) => {
						try {
							let r = e.params.id,
								{ type: n, date: u } = e.body,
								i = {
									transferSchool: 'transferSchool',
									dropout: 'dropout'
								},
								d = null;
							switch (n) {
								case i.transferSchool:
									d = await s.setStudentTransferSchool(r, u);
									break;
								case i.dropout:
									d = await s.setDropoutStudent(r, u);
									break;
								default:
									throw (0, a.default)(400, 'Type is not valid');
							}
							return t.status(o.HttpStatusCode.CREATED).json(d);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					y = async (e, t) => {
						try {
							let r = e.params.type,
								n = e.query.page || 1,
								u = e.query.limit || 10,
								i = e.query.year || new Date().getFullYear(),
								d = {
									transferSchool: 'transferSchool',
									dropout: 'dropout'
								},
								l = [];
							switch (r) {
								case d.transferSchool:
									l = await s.getStudentTransferSchool(Number(i), Number(n), Number(u));
									break;
								case d.dropout:
									l = await s.getStudentDropout(Number(i), Number(n), Number(u));
									break;
								default:
									throw (0, a.default)(400, 'Type is not valid');
							}
							return t.status(o.HttpStatusCode.OK).json(l);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					h = async (e, t) => {
						try {
							let r = e.params.classId,
								a = e.body,
								n = await s.markAttendanceStudent(r, a);
							return t.status(o.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					m = async (e, t) => {
						try {
							let r = e.params.classId,
								a = e.query?.date;
							a = new Date(a ? (0, n.formatDate)(new Date(a)) : (0, n.formatDate)(new Date()));
							let u = await s.dailyAttendanceList(r, a);
							return t.status(o.HttpStatusCode.OK).json(u);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					g = async (e, t) => {
						try {
							let r = e.params.id,
								a = e.query.month || new Date().getMonth() + 1,
								n = e.query.year || new Date().getFullYear(),
								u = await s.attendanceOfStudentByMonth(r, Number(a), Number(n));
							return t.status(o.HttpStatusCode.OK).json(u);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					O = async (e, t) => {
						try {
							let r = e.query.page || 1,
								a = e.query.limit || 10,
								n = await s.getPolicyBeneficiary(Number(r), Number(a));
							return t.status(o.HttpStatusCode.OK).json(n);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					b = async (e, t) => {
						try {
							let r = e.query.page || 1,
								a = e.query.limit || 10,
								u = e.query?.date;
							u = new Date(u ? (0, n.formatDate)(new Date(u)) : (0, n.formatDate)(new Date()));
							let i = await s.getAttendanceAllClass(Number(r), Number(a), u);
							return t.status(o.HttpStatusCode.OK).json(i);
						} catch (e) {
							let r = new u.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			709: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						list: function () {
							return i;
						},
						read: function () {
							return d;
						},
						create: function () {
							return l;
						},
						update: function () {
							return c;
						},
						deleted: function () {
							return f;
						},
						restore: function () {
							return p;
						},
						getTrash: function () {
							return y;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = r(2116),
					u = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = o(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(7696)),
					s = r(1548);
				function o(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (o = function (e) {
						return e ? r : t;
					})(e);
				}
				const i = async (e, t) => {
						try {
							let e = await u.getAllSubjects();
							if (!e) throw a.default.NotFound('Cannot get subjects!');
							return t.status(s.HttpStatusCode.OK).json(e);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					d = async (e, t) => {
						try {
							let r = await u.getOneSubject(e.params.id);
							return t.status(s.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					l = async (e, t) => {
						try {
							let r = await u.createNewSubject(e.body);
							if (!r) throw a.default.BadRequest('Cannot create new subject!');
							return t.status(s.HttpStatusCode.CREATED).json(r);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					c = async (e, t) => {
						try {
							let r = e.params.id,
								a = await u.updateSubject(r, e.body);
							return t.status(s.HttpStatusCode.CREATED).json(a);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t) => {
						try {
							let r,
								n = e.params.id,
								o = e.query.option || 'soft';
							if (!n) throw (0, a.default)(s.HttpStatusCode.NO_CONTENT);
							switch (o) {
								case 'soft':
									r = await u.deleteSoft(n);
									break;
								case 'force':
									r = await u.deleteForce(n);
									break;
								default:
									throw a.default.InternalServerError('InternalServerError');
							}
							return t.status(r.statusCode).json(r);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t) => {
						try {
							let r = e.params.id,
								a = await u.restore(r);
							return t.status(a.statusCode).json(a);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					y = async (e, t) => {
						try {
							let e = await u.getTrash();
							return t.status(s.HttpStatusCode.OK).json(e);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			6858: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						scoreTableInputs: function () {
							return o;
						},
						scoreTableInputOne: function () {
							return i;
						},
						getTranscriptByClass: function () {
							return d;
						},
						getTranscriptByStudent: function () {
							return l;
						}
					});
				const a = r(2116),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(6950)),
					u = r(1548);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = async (e, t) => {
						try {
							let r = e.body,
								a = e.params.subjectId,
								s = e.params.classId,
								o = await n.newScoreList(a, s, r);
							return t.status(u.HttpStatusCode.CREATED).json(o);
						} catch (e) {
							let r = new a.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					i = async (e, t) => {
						try {
							let r = e.body,
								a = e.params.subjectId,
								s = e.params.studentId,
								o = await n.newScore(a, s, r);
							return t.status(u.HttpStatusCode.CREATED).json(o);
						} catch (e) {
							let r = new a.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					d = async (e, t) => {
						try {
							let r = e.params.subjectId,
								a = e.params.classId,
								s = await n.selectSubjectTranscriptByClass(a, r);
							return t.status(u.HttpStatusCode.OK).json(s);
						} catch (e) {
							let r = new a.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					l = async (e, t) => {
						try {
							let r = e.params.id,
								a = await n.selectTranscriptStudent(r);
							return t.status(u.HttpStatusCode.OK).json(a);
						} catch (e) {
							let r = new a.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			4287: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createTimeTable: function () {
							return d;
						},
						updateTimeTable: function () {
							return l;
						},
						deleteTimeTable: function () {
							return c;
						},
						getTimeTableByClass: function () {
							return f;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = r(2116),
					u = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = i(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(1177)),
					s = r(9868),
					o = r(1548);
				function i(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (i = function (e) {
						return e ? r : t;
					})(e);
				}
				const d = async (e, t) => {
						try {
							let { error: r } = (0, s.validateNewTimeTable)(e.body);
							if (r) throw a.default.BadRequest(r.message);
							let n = await u.createTimetable(e.body);
							return t.status(o.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					l = async (e, t) => {
						try {
							let { error: r } = (0, s.validateUpdateTimeTablePayload)(e.body);
							if (r) throw a.default.BadRequest(r.message);
							let n = await u.updateTimetable({
								classId: e.params.classId,
								payload: e.body
							});
							if (!n) throw a.default.NotFound('Cannot find time table to update!');
							return t.status(o.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					c = async (e, t) => {
						try {
							if (!(await u.deleteTimeTable(e.params.classId)))
								throw a.default.NotFound('Cannot find time table to delete!');
							return t.status(o.HttpStatusCode.NO_CONTENT).json({
								message: 'Deleted!',
								statusCode: o.HttpStatusCode.NO_CONTENT
							});
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t) => {
						try {
							let r = await u.getTimetableByClass(e.params.classId);
							if (!r) throw a.default.NotFound('Time table not found!');
							return t.status(o.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new n.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			3793: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createTeacherAccount: function () {
							return y;
						},
						createParentsAccount: function () {
							return h;
						},
						updateUserInfo: function () {
							return m;
						},
						getTeachersByStatus: function () {
							return g;
						},
						deactivateTeacherAccount: function () {
							return O;
						},
						getParentsUserByClass: function () {
							return b;
						},
						searchParentsUsers: function () {
							return _;
						},
						getUserDetails: function () {
							return w;
						}
					}),
					r(1081);
				const a = f(r(8931)),
					n = f(r(9344)),
					u = r(1548),
					s = r(6880),
					o = f(r(5853)),
					i = r(7822),
					d = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = p(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(3019)),
					l = r(2116),
					c = r(3326);
				function f(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function p(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (p = function (e) {
						return e ? r : t;
					})(e);
				}
				const y = async (e, t) => {
						try {
							let { error: r } = (0, c.validateNewTeacherData)(e.body);
							if (r) throw a.default.BadRequest(r.message);
							let l = await d.createUser({
									payload: { ...e.body, role: s.UserRoleEnum.TEACHER },
									multi: !1
								}),
								f = n.default.sign({ auth: l.email }, process.env.ACCESS_TOKEN_SECRET, {
									expiresIn: '7d'
								}),
								p = e.protocol + '://' + e.get('host');
							return (
								await (0, i.sendVerificationEmail)({
									to: e.body.email,
									subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
									template: (0, o.default)({
										redirectDomain: p,
										user: { ...e.body, role: s.UserRoleEnum.TEACHER },
										token: f
									})
								}),
								t.status(u.HttpStatusCode.CREATED).json(l)
							);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					h = async (e, t) => {
						try {
							let r = e.query.multi || !1,
								{ error: l, value: f } = (0, c.validateNewParentsData)({
									payload: e.body,
									multi: !!r
								});
							if (l) throw a.default.BadRequest(l.message);
							let p = Array.isArray(f)
									? f.map((e) => ({
											...e,
											role: s.UserRoleEnum.PARENTS
									  }))
									: { ...f, role: s.UserRoleEnum.PARENTS },
								y = await d.createUser({ payload: p, multi: !!r }),
								h = e.protocol + '://' + e.get('host');
							if (r && Array.isArray(p)) {
								let e = p.map(
									(e) =>
										new Promise((t, r) => {
											let a = n.default.sign({ auth: e?.email }, process.env.ACCESS_TOKEN_SECRET, {
												expiresIn: '7d'
											});
											(0, i.sendVerificationEmail)({
												to: e.email,
												subject:
													'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
												template: (0, o.default)({
													redirectDomain: h,
													token: a,
													user: e
												})
											})
												.then((e) => t(e))
												.catch((e) => t(e));
										})
								);
								await Promise.all(e);
							} else {
								let e = n.default.sign({ auth: p?.email }, process.env.ACCESS_TOKEN_SECRET, {
									expiresIn: '7d'
								});
								(0, i.sendVerificationEmail)({
									to: p?.email,
									subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
									template: (0, o.default)({
										redirectDomain: h,
										token: e,
										user: p
									})
								});
							}
							return t.status(u.HttpStatusCode.CREATED).json(y);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					m = async (e, t) => {
						try {
							let { error: r } = (0, c.validateUpdateUserData)(e.body);
							if (r) throw a.default.BadRequest(r.message);
							let n = await d.updateUserInfo(e.profile?._id, e.body);
							if (!n) throw a.default.BadRequest('User does not exist!');
							return t.status(u.HttpStatusCode.CREATED).json(n);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					g = async (e, t) => {
						try {
							let { status: r } = e.query,
								n = await d.getTeacherUsersByStatus(r);
							if (!n) throw a.default.NotFound('Không thể tìm thấy giáo viên nào!');
							return t.status(u.HttpStatusCode.OK).json(n);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					O = async (e, t) => {
						try {
							let r = await d.deactivateTeacherUser(e.params.userId);
							if (!r) throw a.default.NotFound('Cannot find teacher to deactivate!');
							return t.status(u.HttpStatusCode.CREATED).json(r);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					b = async (e, t) => {
						try {
							let r = await d.getParentsUserByClass(e.params.classId);
							return t.status(u.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					_ = async (e, t) => {
						try {
							let r = await d.searchParents(e.body.searchTerm);
							if (!r) throw a.default.NotFound('Cannot find any parents account!');
							return t.status(u.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					w = async (e, t) => {
						try {
							let r = await d.getUserDetails(e.params.id);
							if (!r) throw a.default.NotFound('User not found!');
							return t.status(u.HttpStatusCode.OK).json(r);
						} catch (e) {
							let r = new l.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					};
			},
			5853: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return n;
						}
					});
				const a = r(2407),
					n = ({ redirectDomain: e, user: t, token: r }) =>
						`\n\t\t\t<div>\n\t\t\t\t<p>\n\t\t\t\t\tThân gửi ${
							t.displayName
						}!\n\t\t\t\t\t<p>\n\t\t\t\t\t\tNgười dùng nhận được mail vui lòng click vào <a href='${
							e + '/api/auth/verify-account' + (0, a.paramsStringify)({ user_type: t.role, token: r })
						}'>link</a> này để xác thực tài khoản.\n\t\t\t\t\t</p>\n\t\t\t\t\t<i>Lưu ý: Mail xác thực này có hiệu lực trong vòng 7 ngày</i>\n\t\t\t\t</p>\n\t\t\t\t<hr>\n\t\t\t\t<p>\n\t\t\t\t\t<span style="display: block">Trân trọng!</span>\n\t\t\t\t\t<i>Tiểu học Bột Xuyên</i>\n\t\t\t\t</p>\n\t\t\t</div>\n\t\t\t\t\t`;
			},
			6542: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						checkAuthenticated: function () {
							return c;
						},
						checkIsHeadmaster: function () {
							return f;
						},
						checkIsTeacher: function () {
							return p;
						}
					}),
					r(1081);
				const a = l(r(8931)),
					n = l(r(9344)),
					u = l(r(9123)),
					s = r(6880),
					o = r(3111),
					i = r(1548),
					d = r(2116);
				function l(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const c = async (e, t, r) => {
						try {
							if (!e.cookies.uid) throw a.default.Unauthorized('Invalid auth id!');
							let t = o.AuthRedisKeyPrefix.ACCESS_TOKEN + e.cookies.uid;
							if (!(await u.default.get(t))) throw a.default.Unauthorized();
							let s = e.cookies.access_token;
							if (!s) throw a.default.Unauthorized();
							let { payload: i } = n.default.verify(s, process.env.ACCESS_TOKEN_SECRET);
							(e.profile = i), (e.role = i.role), r();
						} catch (e) {
							let r = new d.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					f = async (e, t, r) => {
						try {
							if (e.role !== s.UserRoleEnum.HEADMASTER)
								throw a.default.Forbidden('Only headmaster allowed to access!');
							r();
						} catch (e) {
							let r = new d.HttpException(e);
							return t.status(r.statusCode).json(r);
						}
					},
					p = async (e, t, r) => {
						try {
							if (e.role !== s.UserRoleEnum.HEADMASTER || e.role !== s.UserRoleEnum.HEADMASTER)
								return t.status(i.HttpStatusCode.FORBIDDEN).json({
									message: 'Only teacher/headmaster allowed to access!',
									statusCode: i.HttpStatusCode.FORBIDDEN
								});
							r();
						} catch (r) {
							let e = new d.HttpException(r);
							return t.status(e.statusCode).json(e);
						}
					};
			},
			3562: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = s(r(1185)),
					n = s(r(3760)),
					u = s(r(314));
				function s(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const o = new a.default.Schema(
					{
						className: {
							type: String,
							require: !0,
							trim: !0,
							uppercase: !0,
							unique: !0
						},
						grade: { type: Number, enum: [1, 2, 3, 4, 5], require: !0 },
						headTeacher: {
							type: a.default.Types.ObjectId,
							ref: 'Users',
							autopopulate: { select: '_id displayName phone email' }
						}
					},
					{ collection: 'classes', timestamps: !0 }
				);
				o.plugin(u.default),
					o.plugin(n.default, {
						overrideMethods: ['find', 'findOne'],
						deletedAt: !0
					}),
					o.virtual('students', {
						localField: '_id',
						foreignField: 'class',
						ref: 'students'
					});
				const i = a.default.model('Classes', o);
			},
			8501: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return d;
						}
					});
				const a = o(r(1185)),
					n = o(r(314)),
					u = o(r(3760)),
					s = o(r(8037));
				function o(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const i = new a.default.Schema({
					subject: {
						type: a.default.Types.ObjectId,
						ref: 'Subjects',
						require: !0,
						autopopulate: !0
					},
					grade: { type: Number, enum: [1, 2, 3, 4, 5], require: !0 },
					fileId: { type: String, require: !0, trim: !0 },
					fileName: { type: String, required: !0, trim: !0 },
					mimeType: { type: String, required: !0 },
					downloadUrl: { type: String, default: '' }
				});
				i.plugin(n.default),
					i.plugin(s.default),
					i.plugin(u.default, {
						overrideMethods: ['find', 'findOne'],
						deletedAt: !0
					}),
					i.pre('save', function () {
						this.downloadUrl = 'https://drive.google.com/uc?export=download&id=' + this.fileId;
					});
				const d = a.default.model('learning_materials', i);
			},
			8321: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return l;
						}
					});
				const a = i(r(1185)),
					n = i(r(314)),
					u = i(r(3760)),
					s = r(8324),
					o = r(6880);
				function i(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const d = new a.default.Schema({
					role: {
						type: String,
						require: !0,
						trim: !0,
						enum: o.UserRoleEnum
					},
					type: { type: String, require: !0, trim: !0 },
					permissions: [
						{
							type: { type: String, uppercase: !0 },
							allowedActions: [{ type: String, enum: s.PermissionActionsEnum }]
						}
					]
				});
				d.plugin(n.default), d.plugin(u.default, { deletedAt: !0, overrideMethods: !0 });
				const l = a.default.model('Permissions', d);
			},
			6262: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return o;
						}
					});
				const a = u(r(1185)),
					n = u(r(8037));
				function u(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const s = new a.default.Schema(
					{
						startAt: {
							type: Number,
							default: new Date().getFullYear(),
							unique: !0
						},
						endAt: { type: Number, unique: !0 }
					},
					{ collection: 'school_years', timestamps: !0 }
				);
				s.pre('save', function () {
					this.endAt = this.startAt + 1;
				}),
					s.plugin(n.default);
				const o = a.default.model('SchoolYears', s);
			},
			2512: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return c;
						}
					});
				const a = i(r(314)),
					n = i(r(1185)),
					u = i(r(3760)),
					s = i(r(8037)),
					o = r(7790);
				function i(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const d = new n.default.Schema(
					{
						code: { type: String, uppercase: !0, unique: !0 },
						class: { type: n.default.Types.ObjectId, ref: 'Classes' },
						fullName: {
							type: String,
							require: !0,
							trim: !0,
							minLength: 6
						},
						gender: { type: Boolean, require: !0 },
						dateOfBirth: { type: Date, require: !0 },
						parentsPhoneNumber: { type: String, require: !0 },
						isPolicyBeneficiary: { type: Boolean, default: !1 },
						isGraduated: { type: Boolean, default: !1 },
						transferSchool: { type: Date, default: null },
						dropoutDate: { type: Date, default: null },
						absentDays: [
							{
								date: { type: Date, default: new Date() },
								schoolYear: {
									type: n.default.Types.ObjectId,
									ref: 'SchoolYears',
									autopopulate: !0
								},
								hasPermision: { type: Boolean, default: !1 },
								reason: {
									type: String,
									minlength: 8,
									maxLength: 256,
									default: 'Không có lý do'
								}
							}
						]
					},
					{ timestamps: !0, collection: 'students' }
				);
				d.plugin(s.default),
					d.plugin(u.default, {
						overrideMethods: ['find', 'findOne'],
						deletedAt: !0
					}),
					d.plugin(a.default);
				const l = n.default.model('Students', d);
				d.pre('save', function () {
					this.fullName = (0, o.toCapitalize)(this.fullName);
				});
				const c = l;
			},
			3664: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = s(r(1185)),
					n = s(r(3760)),
					u = r(7790);
				function s(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const o = new a.default.Schema(
					{ subjectName: String, slug: { type: String, unique: !0 } },
					{ collection: 'subjects', timestamps: !0 }
				);
				o.plugin(n.default, {
					overrideMethods: ['find', 'findOne'],
					deletedAt: !0
				}),
					o.pre('save', function (e) {
						(this.slug = (0, u.createSlug)(this.subjectName)), e();
					});
				const i = a.default.model('Subjects', o);
			},
			4729: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = s(r(1185)),
					n = s(r(314)),
					u = s(r(3760));
				function s(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const o = new a.default.Schema(
					{
						student: {
							type: a.default.Types.ObjectId,
							require: !0,
							ref: 'Students',
							autopopulate: { select: 'fullName _id class' }
						},
						schoolYear: {
							type: a.default.Types.ObjectId,
							ref: 'SchoolYears',
							autopopulate: !0,
							require: !0
						},
						subject: {
							type: a.default.Types.ObjectId,
							require: !0,
							ref: 'Subjects',
							autopopulate: { select: 'subjectName' }
						},
						firstSemester: {
							midtermTest: { type: Number, default: 0, min: 0, max: 10 },
							finalTest: { type: Number, default: 0, min: 0, max: 10 }
						},
						secondSemester: {
							midtermTest: { type: Number, default: 0, min: 0, max: 10 },
							finalTest: { type: Number, default: 0, min: 0, max: 10 }
						}
					},
					{ collection: 'subject_transcriptions' }
				);
				o.plugin(u.default, {
					overrideMethods: ['find', 'findOne'],
					deletedAt: !0
				}),
					o.plugin(n.default);
				const i = a.default.model('SubjectTranscriptions', o);
			},
			9374: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = u(r(1185)),
					n = u(r(314));
				function u(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const s = new a.default.Schema(
						{
							period: {
								type: Number,
								require: !0,
								enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
							},
							subject: {
								type: a.default.Types.ObjectId,
								ref: 'Subjects',
								require: !0,
								autopopulate: { select: 'subjectName _id' }
							},
							teacher: {
								type: a.default.Types.ObjectId,
								ref: 'Users',
								require: !0,
								autopopulate: { select: 'displayName _id' }
							}
						},
						{ _id: !1 }
					),
					o = new a.default.Schema(
						{
							class: {
								type: a.default.Schema.Types.ObjectId,
								ref: 'Classes',
								required: !0
							},
							schedule: {
								monday: [s],
								tuesday: [s],
								wednessday: [s],
								thursday: [s],
								friday: [s],
								saturday: [s]
							}
						},
						{ timestamps: !0, versionKey: !1, collection: 'time_tables' }
					);
				o.plugin(n.default);
				const i = a.default.model('TimeTables', o);
			},
			7130: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return p;
						}
					});
				const a = (function (e, t) {
					if (e && e.__esModule) return e;
					if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
					var r = l(t);
					if (r && r.has(e)) return r.get(e);
					var a = {},
						n = Object.defineProperty && Object.getOwnPropertyDescriptor;
					for (var u in e)
						if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
							var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
							s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
						}
					return (a.default = e), r && r.set(e, a), a;
				})(r(7096));
				r(1081);
				const n = d(r(1185)),
					u = d(r(3760)),
					s = d(r(314)),
					o = r(6880),
					i = d(r(2365));
				function d(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function l(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (l = function (e) {
						return e ? r : t;
					})(e);
				}
				const c = new n.default.Schema(
					{
						email: { type: String, trim: !0, unique: !0 },
						phone: { type: String, require: !0, unique: !0 },
						displayName: { type: String, require: !0, trim: !0 },
						dateOfBirth: { type: Date, require: !0 },
						address: { type: String, require: !0 },
						gender: {
							type: String,
							require: !0,
							enum: Object.values(o.UserGenderEnum)
						},
						picture: { type: String, trim: !0, require: !0 },
						eduBackground: {
							type: {
								qualification: String,
								universityName: String,
								graduatedAt: Date
							},
							_id: !1
						},
						employmentStatus: { type: Boolean, default: !1 },
						role: {
							type: String,
							trim: !0,
							require: !0,
							enum: Object.values(o.UserRoleEnum)
						},
						isVerified: { type: Boolean, default: !1 }
					},
					{
						timestamps: !0,
						toJSON: { virtuals: !0 },
						versionKey: !1,
						autoIndex: !0
					}
				);
				c.index({ displayName: 'text' }),
					c.virtual('children', {
						localField: 'phone',
						foreignField: 'parentsPhoneNumber',
						ref: 'Students',
						justOne: !0,
						options: { lean: !0 }
					}),
					c.virtual('userStatusText').get(function () {
						switch (!0) {
							case !this.isVerified:
								return 'Chưa kích hoạt';
							case this.employmentStatus:
								return 'Đang làm việc';
							case !this.employmentStatus:
								return 'Đã nghỉ việc';
							default:
								return '';
						}
					}),
					(c.methods.verifyPassword = function (e) {
						return !!e && a.default.compareSync(e, this.password);
					}),
					c.pre('save', function (e) {
						this.password &&
							(this.password = a.default.hashSync(this.password, (0, a.genSaltSync)(+process.env.SALT_ROUND))),
							e();
					}),
					c.plugin(u.default, {
						overrideMethods: ['find', 'findOne', 'findOneAndUpdate'],
						deletedAt: !0
					}),
					c.plugin(i.default),
					c.plugin(s.default);
				const f = n.default.model('Users', c);
				f.createIndexes();
				const p = f;
			},
			3813: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return c;
						}
					});
				const a = i(r(6860)),
					n = i(r(3511)),
					u = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = d(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(5355)),
					s = i(r(2057)),
					o = r(6542);
				function i(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function d(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (d = function (e) {
						return e ? r : t;
					})(e);
				}
				const l = a.default.Router();
				l.get('/auth/google', n.default.authenticate('google', { scope: ['email', 'profile'] })),
					l.get(
						'/auth/google/callback',
						n.default.authenticate('google', {
							failureRedirect: `${s.default.CLIENT_URL}/signin`
						}),
						u.signinWithGoogle
					),
					l.get('/auth/signout', o.checkAuthenticated, u.signout),
					l.get('/auth/user', o.checkAuthenticated, u.getUser),
					l.get('/auth/verify-account', u.verifyAccount),
					l.get('/auth/refresh-token', u.refreshToken),
					l.post('/auth/send-otp', u.sendOtp);
				const c = l;
			},
			8447: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(9105)),
					u = r(6542);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = a.default.Router();
				o.post('/classes', u.checkAuthenticated, u.checkIsHeadmaster, n.createClass),
					o.put('/classes/:id/restore', u.checkAuthenticated, u.checkIsHeadmaster, n.restoreClass),
					o.put('/classes/:id', u.checkAuthenticated, u.checkIsHeadmaster, n.updateClass),
					o.delete('/classes/:id', u.checkAuthenticated, u.checkIsHeadmaster, n.removeClass),
					o.get('/classes/trash', u.checkIsHeadmaster, n.getClassTrash),
					o.get('/classes', u.checkAuthenticated, n.getClasses),
					o.get('/classes/:id', u.checkAuthenticated, u.checkIsTeacher, n.getClassOne);
				const i = o;
			},
			2852: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return g;
						}
					});
				const a = y(r(6860)),
					n = y(r(8158)),
					u = y(r(630)),
					s = y(r(8214)),
					o = y(r(3813)),
					i = y(r(8447)),
					d = y(r(8265)),
					l = y(r(5720)),
					c = y(r(6630)),
					f = y(r(8996)),
					p = y(r(369));
				function y(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const h = [
						i.default,
						n.default,
						o.default,
						u.default,
						c.default,
						s.default,
						p.default,
						f.default,
						l.default,
						d.default
					],
					m = a.default.Router();
				h.forEach((e) => {
					m.use(e);
				});
				const g = m;
			},
			8996: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return c;
						}
					});
				const a = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = i(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(6886)),
					n = o(r(6860)),
					u = o(r(1738)),
					s = r(6542);
				function o(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function i(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (i = function (e) {
						return e ? r : t;
					})(e);
				}
				const d = (0, u.default)(),
					l = n.default.Router();
				l.post('/learning-materials/upload', s.checkAuthenticated, s.checkIsTeacher, d.any(), a.uploadFile),
					l.get('/learning-materials', s.checkAuthenticated, s.checkIsTeacher, a.getFiles),
					l.patch('/learning-materials/:fileId/edit', s.checkAuthenticated, s.checkIsTeacher, a.updateFile),
					l.delete('/learning-materials/:fileId/delete', s.checkAuthenticated, s.checkIsTeacher, a.deleteFile);
				const c = l;
			},
			369: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(3750)),
					u = r(6542);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = a.default.Router();
				o.get('/permissions/get-by-roll', n.read),
					o.post('/permissions', n.create),
					o.put('/permissions/:id', u.checkAuthenticated, u.checkIsHeadmaster, n.update),
					o.put('/permissions/:id/restore', u.checkAuthenticated, u.checkIsHeadmaster, n.restore),
					o.delete('/permissions/:id', u.checkAuthenticated, u.checkIsHeadmaster, n.remove);
				const i = o;
			},
			8214: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(1288)),
					u = r(6542);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = a.default.Router();
				o.get('/schoolYears/current', u.checkAuthenticated, n.getCurrentYear),
					o.get('/schoolYears', u.checkAuthenticated, n.schoolYearList),
					o.post('/schoolYears', u.checkAuthenticated, u.checkIsHeadmaster, n.createSchoolYear);
				const i = o;
			},
			630: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return s;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = r(9732),
					u = a.default.Router();
				u.get('/students/attendance', n.selectAttendanceAllClass),
					u.get('/students/attendance/:classId', n.selectAttendanceByClass),
					u.get('/students/attendance/student/:id', n.selectAttendanceByStudent),
					u.get('/students/policyBeneficiary', n.getPolicyBeneficiary),
					u.get('/students/stop/:type', n.getStudentStop),
					u.get('/students/detail/:id', n.getStudentDetail),
					u.get('/students/:class', n.getStudentByClass),
					u.post('/students', n.createStudent),
					u.put('/students/attendance/:classId', n.attendanceStudentByClass),
					u.put('/students/services/:id', n.serviceStudent),
					u.put('/students/:id', n.updateStudent);
				const s = u;
			},
			6630: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = r(6542),
					u = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(709));
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = a.default.Router();
				o.put('/subjects/restore/:id', n.checkAuthenticated, n.checkIsHeadmaster, u.restore),
					o.get('/subjects/trash', n.checkAuthenticated, n.checkIsTeacher, u.getTrash),
					o.post('/subjects', n.checkAuthenticated, n.checkIsHeadmaster, u.create),
					o.get('/subjects/:id', n.checkAuthenticated, n.checkIsTeacher, u.read),
					o.put('/subjects/:id', n.checkAuthenticated, n.checkIsHeadmaster, u.update),
					o.delete('/subjects/:id', n.checkAuthenticated, n.checkIsHeadmaster, u.deleted),
					o.get('/subjects', n.checkAuthenticated, n.checkIsTeacher, u.list);
				const i = o;
			},
			5720: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return o;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = u(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var s in e)
							if ('default' !== s && Object.prototype.hasOwnProperty.call(e, s)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, s) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, s, o) : (a[s] = e[s]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(6858));
				function u(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (u = function (e) {
						return e ? r : t;
					})(e);
				}
				const s = a.default.Router();
				s.post('/transcripts/:classId/:subjectId', n.scoreTableInputs),
					s.post('/transcripts/:studentId/:subjectId', n.scoreTableInputOne),
					s.get('/transcripts/class/:classId/:subjectId', n.getTranscriptByClass),
					s.get('/transcripts/student/:id', n.getTranscriptByStudent);
				const o = s;
			},
			8265: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return o;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = u(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var s in e)
							if ('default' !== s && Object.prototype.hasOwnProperty.call(e, s)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, s) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, s, o) : (a[s] = e[s]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(4287));
				function u(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (u = function (e) {
						return e ? r : t;
					})(e);
				}
				const s = a.default.Router();
				s.get('/time-table/:classId', n.getTimeTableByClass),
					s.post('/time-table/create', n.createTimeTable),
					s.patch('/time-table/:classId/update', n.updateTimeTable),
					s.delete('/time-table/:classId/delete', n.deleteTimeTable);
				const o = s;
			},
			8158: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(6860)),
					n = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = s(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, u, o) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(3793)),
					u = r(6542);
				function s(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (s = function (e) {
						return e ? r : t;
					})(e);
				}
				const o = a.default.Router();
				o.post('/users/create-teacher-account', u.checkAuthenticated, u.checkIsHeadmaster, n.createTeacherAccount),
					o.post('/users/create-parents-account', u.checkAuthenticated, u.checkIsTeacher, n.createParentsAccount),
					o.patch(
						'/users/teachers/:userId/deactivate',
						u.checkAuthenticated,
						u.checkIsHeadmaster,
						n.deactivateTeacherAccount
					),
					o.patch('/update-user', u.checkAuthenticated, n.updateUserInfo),
					o.get('/users/teachers', u.checkAuthenticated, n.getTeachersByStatus),
					o.get('/users/:id', u.checkAuthenticated, u.checkIsHeadmaster, n.getUserDetails),
					o.get('/users/parents/:classId', u.checkAuthenticated, n.getParentsUserByClass),
					o.post('/users/search-parents', u.checkAuthenticated, u.checkIsTeacher, n.searchParentsUsers);
				const i = o;
			},
			4923: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createClass: function () {
							return i;
						},
						checkClassesExists: function () {
							return d;
						},
						updateClasses: function () {
							return l;
						},
						softDeleteClass: function () {
							return c;
						},
						restoreClass: function () {
							return f;
						},
						forceDeleteClass: function () {
							return p;
						}
					});
				const a = o(r(8931)),
					n = o(r(1185)),
					u = o(r(3562)),
					s = r(6813);
				function o(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const i = async (e) => {
						try {
							let t = (0, s.validateClassData)(e);
							if (t.error) throw (0, a.default)(502, t.error.message);
							let { exists: r } = await d('', {
								className: e.className
							});
							if (r) throw (0, a.default)(409, `Class ${e.className} already exists`);
							return { classes: await new u.default(e).save() };
						} catch (e) {
							throw e;
						}
					},
					d = async (e, t = {}) => {
						try {
							let r = { ...t };
							if (e) {
								if (!n.default.Types.ObjectId.isValid(e))
									throw a.default.BadRequest('_id of the classes is invalid');
								r = { ...t, _id: e };
							}
							let s = await u.default.findOne({ ...r });
							return { exists: !!s, classes: s };
						} catch (e) {
							throw e;
						}
					},
					l = async (e, t) => {
						try {
							if (0 === Object.keys(e).length) throw (0, a.default)(304);
							let { exists: r, classes: n } = await d(t);
							if (e.className && !e.grade && !e.className.startsWith(JSON.stringify(n?.grade)))
								throw a.default.BadRequest('Invalid Class name, classname: grade+"A|B|C|D..."');
							if (!r) throw a.default.NotFound('Classes does not exist');
							let { error: o } = (0, s.validateClassEditData)(e);
							if (o) throw a.default.BadRequest(o.message);
							return await u.default.findOneAndUpdate({ _id: t }, e, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					c = async (e) => {
						try {
							return (
								await u.default.delete({ _id: e }),
								{
									message: 'Moved the class to the trash',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					f = async (e) => {
						try {
							return (
								await u.default.restore({ _id: e }), { message: 'Class have been restored', statusCode: 200 }
							);
						} catch (e) {
							throw e;
						}
					},
					p = async (e) => {
						try {
							return (
								await u.default.deleteOne({ _id: e }),
								{
									message: 'Class has been permanently deleted',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					};
			},
			6954: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						uploadFile: function () {
							return u;
						},
						deleteFile: function () {
							return s;
						}
					}),
					r(1081);
				const a = r(2781),
					n = r(582),
					u = async (e, t = process.env.FOLDER_ID) => {
						try {
							let r = new a.Stream.PassThrough();
							r.end(e.buffer);
							let u = await n.drive.files.create({
								requestBody: { name: e.originalname, parents: [t] },
								media: { body: r },
								fields: 'id'
							});
							return (
								console.log(u),
								await (async (e) => {
									try {
										return (
											await n.drive.permissions.create({
												fileId: e,
												requestBody: {
													role: 'reader',
													type: 'anyone'
												}
											}),
											n.drive.files.get({
												fileId: e,
												fields: 'webViewLink, webContentLink'
											})
										);
									} catch (e) {
										console.log(e);
									}
								})(u.data.id),
								u
							);
						} catch (e) {
							throw e;
						}
					},
					s = async (e) => {
						try {
							return await n.drive.files.delete({ fileId: e });
						} catch (e) {
							return Promise.resolve(e);
						}
					};
			},
			4720: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						getFiles: function () {
							return u;
						},
						saveFile: function () {
							return s;
						},
						updateFile: function () {
							return o;
						},
						softDeleteFile: function () {
							return i;
						},
						hardDeleteFile: function () {
							return d;
						},
						restoreDeletedFile: function () {
							return l;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8501)),
					n = r(6954),
					u = async (e, t) => {
						try {
							return await a.default.paginate(e, t);
						} catch (e) {
							throw e;
						}
					},
					s = async (e) => {
						try {
							return console.log(e), await new a.default(e).save();
						} catch (e) {
							throw e;
						}
					},
					o = async (e, t) => {
						try {
							return await a.default.findOneAndUpdate({ fileId: e }, t, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					i = async (e) => {
						try {
							return await a.default.delete({ fileId: e });
						} catch (e) {
							throw e;
						}
					},
					d = async (e) => {
						try {
							return await Promise.all([a.default.findOneAndDelete({ fileId: e }), (0, n.deleteFile)(e)]);
						} catch (e) {
							throw e;
						}
					},
					l = async (e) => {
						try {
							return await a.default.restore({ fileId: e });
						} catch (e) {
							throw e;
						}
					};
			},
			7822: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'sendVerificationEmail', {
						enumerable: !0,
						get: function () {
							return s;
						}
					});
				const a = u(r(5103)),
					n = u(r(8931));
				function u(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const s = async ({ to: e, subject: t, template: r }) =>
					await a.default.sendMail(
						{
							from: {
								address: process.env.AUTH_EMAIL,
								name: 'Tiểu học Bột Xuyên'
							},
							to: e,
							subject: t,
							html: r
						},
						(t, r) => {
							if ((console.log('recipient:>>>', e), console.log('err:>>>', t), t))
								throw n.default.InternalServerError('Failed to send mail');
							console.log(r.response);
						}
					);
			},
			7273: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createPermission: function () {
							return n;
						},
						getPermissions: function () {
							return u;
						},
						getPermissionByRole: function () {
							return s;
						},
						deletePermission: function () {
							return o;
						},
						forceDeletePermission: function () {
							return i;
						},
						restoreDeletedPermission: function () {
							return d;
						},
						updatePermission: function () {
							return l;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8321)),
					n = async (e) => {
						try {
							return await new a.default(e).save();
						} catch (e) {
							throw e;
						}
					},
					u = async () => {
						try {
							return await a.default.find().exec();
						} catch (e) {
							throw e;
						}
					},
					s = async (e) => {
						try {
							return await a.default.find({ role: e }).exec();
						} catch (e) {
							throw e;
						}
					},
					o = async (e) => {
						try {
							return (
								await a.default.delete({ _id: e }),
								{
									message: 'The permission has been successfully moved to the trash',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					i = async (e) => {
						try {
							return (
								await a.default.deleteOne({ _id: e }),
								{
									message: 'The permission has been successfully deleted permanently',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					d = async (e) => {
						try {
							return (
								await a.default.restore({ _id: e }),
								{
									message: 'The permission has been successfully restored',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					l = async (e, t) => {
						try {
							return await a.default.findOneAndUpdate({ _id: e }, t, { new: !0 }).exec();
						} catch (e) {
							throw e;
						}
					};
			},
			254: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						getAllSchoolYear: function () {
							return s;
						},
						createSchoolYear: function () {
							return o;
						},
						selectSchoolYearCurr: function () {
							return i;
						}
					});
				const a = u(r(6262)),
					n = u(r(8931));
				function u(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const s = async (e, t) => {
						try {
							return await a.default.paginate({}, { limit: e, page: t, sort: { startAt: 'asc' } });
						} catch (e) {
							throw e;
						}
					},
					o = async () => {
						try {
							let e = await a.default.findOne({
								startAt: new Date().getFullYear(),
								endAt: new Date().getFullYear() + 1
							});
							if (e) throw (0, n.default)(409, `The academic year ${e.startAt}-${e.endAt} already exists`);
							return await new a.default({}).save();
						} catch (e) {
							throw e;
						}
					},
					i = async () => {
						try {
							let e = await a.default.findOne({
								$and: [
									{ startAt: { $lte: new Date().getFullYear() } },
									{ endAt: { $gte: new Date().getFullYear() } }
								]
							});
							if (!e)
								throw (0, n.default)(404, 'The new academic year has not started yet, please come back later');
							return e;
						} catch (e) {
							throw e;
						}
					};
			},
			4128: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return n;
						}
					});
				const a = (function (e) {
					return e && e.__esModule ? e : { default: e };
				})(r(1921));
				'production'?.includes('production') && process.env.SMS_VIRTUAL_PHONE;
				const n = async ({ to: e, text: t }) =>
					await a.default.sms
						.send({ from: 'Vonage APIs', to: e, text: t })
						.then((e) => (console.log(e), e))
						.catch((e) => console.log(e));
			},
			4051: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createStudent: function () {
							return p;
						},
						updateStudent: function () {
							return h;
						},
						getStudentByClass: function () {
							return m;
						},
						getDetailStudent: function () {
							return g;
						},
						setStudentTransferSchool: function () {
							return O;
						},
						setDropoutStudent: function () {
							return b;
						},
						getStudentTransferSchool: function () {
							return _;
						},
						getStudentDropout: function () {
							return w;
						},
						markAttendanceStudent: function () {
							return E;
						},
						dailyAttendanceList: function () {
							return j;
						},
						attendanceOfStudentByMonth: function () {
							return T;
						},
						getPolicyBeneficiary: function () {
							return S;
						},
						getAttendanceAllClass: function () {
							return v;
						}
					});
				const a = f(r(8931)),
					n = f(r(1185)),
					u = r(7790),
					s = f(r(3562)),
					o = f(r(2512)),
					i = r(530),
					d = r(6950),
					l = r(254),
					c = r(1548);
				function f(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const p = async (e) => {
						try {
							if (Array.isArray(e)) return await y(e);
							if (!e) throw (0, a.default)(c.HttpStatusCode.NO_CONTENT);
							let { error: t } = (0, i.validateReqBodyStudent)(e);
							if (t) throw a.default.BadRequest(t.message);
							if (await o.default.findOne({ code: e.code }))
								throw (0, a.default)(409, 'Student already exists ');
							return await new o.default(e).save();
						} catch (e) {
							throw e;
						}
					},
					y = async (e) => {
						try {
							if (0 === e.length) throw (0, a.default)(c.HttpStatusCode.NO_CONTENT);
							if (e.length > 50)
								throw a.default.PayloadTooLarge('You are only allowed to add 50 students at a time');
							let t = [];
							if (
								(e.forEach((e) => {
									let { error: r } = (0, i.validateReqBodyStudent)(e);
									r &&
										t.push({
											fullName: e.fullName,
											parentPhone: e.parentsPhoneNumber,
											message: r.message
										});
								}),
								t.length > 0)
							)
								throw (0, a.default)(400, 'The student does not satisfy the validation requirements', {
									error: t
								});
							let r = [],
								n = e.map((e) => e.code);
							if (
								((await o.default.find({ code: { $in: n } })).forEach((t) => {
									e.find((e) => e.code === t.code) &&
										r.push({
											fullName: t.fullName,
											parentPhone: t.parentsPhoneNumber
										});
								}),
								r.length > 0)
							)
								throw (0, a.default)(409, 'Student already exists', {
									error: r
								});
							return await o.default.insertMany(e);
						} catch (e) {
							throw e;
						}
					},
					h = async (e, t) => {
						try {
							if (!t || 0 === Object.keys(t).length) throw (0, a.default)(c.HttpStatusCode.NO_CONTENT);
							if (!e || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the student is invalid');
							let { error: r } = (0, i.validateUpdateReqBodyStudent)(t);
							if (r) throw a.default.BadRequest(r.message);
							let s = await o.default.findOne({ _id: e });
							if (!s) throw a.default.NotFound('Student does not exist!');
							if (
								(() => {
									let e = { ...JSON.parse(JSON.stringify(s)) };
									return delete e._id, (0, u.compareObject)({ ...e, ...t }, e);
								})()
							)
								throw (0, a.default)(304);
							return await o.default.findOneAndUpdate({ _id: e }, t, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					m = async (e, t, r, u) => {
						try {
							if (!e || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the class is invalid');
							if (
								![
									'code',
									'fullName',
									'gender',
									'dateOfBirth',
									'class',
									'parentsPhoneNumber',
									'isPolicyBeneficiary',
									'isGraduated'
								].includes(r)
							)
								throw a.default.BadRequest(
									"_sort can only belong to ['code','fullName','gender','dateOfBirth','class','parentsPhoneNumber','isPolicyBeneficiary','isGraduated']"
								);
							return await o.default
								.find({
									class: e,
									dropoutDate: null,
									transferSchool: null
								})
								.sort({ [r]: t })
								.select(u);
						} catch (e) {
							throw e;
						}
					},
					g = async (e) => {
						try {
							if (!e || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the student is invalid');
							let t = await o.default.findOne({ _id: e }).populate({
									path: 'class',
									select: 'className headTeacher'
								}),
								r = await (0, d.selectTranscriptStudent)(e);
							if (!t) throw a.default.NotFound('Student does not exist!');
							return { info: t, transcript: r };
						} catch (e) {
							throw e;
						}
					},
					O = async (e, t) => {
						try {
							if (!e) throw a.default.BadRequest('_id of the student is invalid');
							let r = new Date(t);
							if (isNaN(r.getTime()))
								throw a.default.BadRequest('The Date you passed is not in the correct Date data type');
							if (
								!(await o.default.findOne({
									_id: e,
									transferSchool: null,
									dropoutDate: null
								}))
							)
								throw a.default.NotFound('The student has transferred to another school or dropped out');
							return await o.default.findOneAndUpdate({ _id: e }, { transferSchool: t }, { new: !0 });
						} catch (e) {
							throw e;
						}
					},
					b = async (e, t) => {
						try {
							if (!e) throw a.default.BadRequest('_id of the student is invalid');
							let r = new Date(t);
							if (isNaN(r.getTime()))
								throw a.default.BadRequest('The Date you passed is not in the correct Date data type');
							if (
								!(await o.default.findOne({
									_id: e,
									transferSchool: null,
									dropoutDate: null
								}))
							)
								throw a.default.NotFound('The student has transferred to another school or dropped out');
							return await o.default.findOneAndUpdate({ _id: e }, { dropoutDate: t }, { new: !0 });
						} catch (e) {
							throw e;
						}
					},
					_ = async (e, t, r) => {
						try {
							let a = {
								$expr: { $eq: [{ $year: '$transferSchool' }, e] }
							};
							return (
								'all' === e && (a = { transferSchool: { $ne: null } }),
								await o.default.paginate(a, { page: t, limit: r })
							);
						} catch (e) {
							throw e;
						}
					},
					w = async (e, t, r) => {
						try {
							let a = { $expr: { $eq: [{ $year: '$dropoutDate' }, e] } };
							return (
								'all' === e && (a = { dropoutDate: { $ne: null } }),
								await o.default.paginate(a, { page: t, limit: r })
							);
						} catch (e) {
							throw e;
						}
					},
					E = async (e, t) => {
						try {
							if (!t) throw (0, a.default)(c.HttpStatusCode.NO_CONTENT);
							if (!Array.isArray(t))
								throw (0, a.default)(400, 'The list of absent students is not an array type');
							if (0 === t.length) return { message: 'Attendance has been saved!' };
							let r = [],
								s = '';
							if (
								(t.forEach((e) => {
									if (
										((e.idStudent && n.default.Types.ObjectId.isValid(e.idStudent)) ||
											(s = 'idStudent of the student is invalid'),
										e.absent)
									) {
										let { error: t } = (0, i.validateAttendanceStudent)(e.absent);
										t && (s += ' && ' + t.message);
									}
									s.length > 0 && r.push({ id: e.idStudent, message: s });
								}),
								r.length > 0)
							)
								throw (0, a.default)(400, 'The body data does not satisfy the validation', {
									error: r
								});
							let d = (0, u.getPropertieOfArray)(t, 'idStudent'),
								f = await o.default.find({ _id: { $in: d }, class: e }),
								p = [];
							if (
								(f.length !== d.length &&
									d.forEach((e) => {
										f.find((t) => t._id.toString() === e) || p.push(e);
									}),
								p.length > 0)
							)
								throw (0, a.default)(404, 'This student does not exist in the class', {
									error: p
								});
							let y = [];
							if (
								(f.forEach((e) => {
									let t = e.absentDays?.find((e) => 0 === (0, u.compareDates)(new Date(), e?.date));
									t &&
										y.push({
											id: e._id.toString(),
											name: e.fullName
										});
								}),
								y.length > 0)
							)
								throw (0, a.default)(409, "Today's attendance for the student already exists", { error: y });
							let h = await (0, l.selectSchoolYearCurr)(),
								m = t.map((e) => ({
									updateOne: {
										filter: { _id: e.idStudent },
										update: {
											$push: {
												absentDays: {
													...e.absent,
													date: new Date(),
													schoolYear: h._id
												}
											}
										}
									}
								}));
							return await o.default.bulkWrite(m), { message: 'Attendance has been saved!' };
						} catch (e) {
							throw e;
						}
					},
					j = async (e, t) => {
						try {
							if (!e || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('The provided idClass is invalid');
							let r = new Date(t);
							r.setDate(r.getDate() + 1);
							let u = await o.default
								.find({
									absentDays: {
										$elemMatch: { date: { $gte: t, $lt: r } }
									},
									class: e
								})
								.lean();
							if (0 === u.length) return { absent: 0, students: [] };
							let s = u.map((e) => {
								let t = !0,
									r = u.find((t) => t._id.toString() === e._id.toString());
								return (t = !r), { ...e, attendanceStatus: t };
							});
							return { absent: u.length, students: s };
						} catch (e) {
							throw e;
						}
					},
					T = async (e, t, r) => {
						try {
							let {
									info: { absentDays: a }
								} = await g(e),
								n = [];
							return (
								a?.forEach((e) => {
									let a = new Date(e.date),
										u = a.getMonth() + 1,
										s = a.getFullYear();
									u === t && s === r && n.push(e);
								}),
								n
							);
						} catch (e) {
							throw e;
						}
					},
					S = async (e, t) =>
						await o.default.paginate(
							{
								dropoutDate: null,
								transferSchool: null,
								isPolicyBeneficiary: !0
							},
							{
								page: e,
								limit: t,
								select: '-absentDays',
								sort: { class: 'desc' }
							}
						),
					v = async (e, t, r) => {
						try {
							let a = new Date(r);
							a.setDate(r.getDate() + 1);
							let n = await o.default.paginate(
									{
										absentDays: {
											$elemMatch: { date: { $gte: r, $lt: a } }
										}
									},
									{
										lean: !0,
										page: e,
										limit: t,
										sort: { class: 'desc' },
										populate: { path: 'class', select: 'className' }
									}
								),
								u = await s.default.find({}).sort({ grade: 'asc' }).lean().select('className');
							return { ...n, classes: u };
						} catch (e) {
							throw e;
						}
					};
			},
			7696: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						getAllSubjects: function () {
							return d;
						},
						getOneSubject: function () {
							return l;
						},
						createNewSubject: function () {
							return c;
						},
						checkSubjectExist: function () {
							return f;
						},
						updateSubject: function () {
							return p;
						},
						deleteSoft: function () {
							return y;
						},
						deleteForce: function () {
							return h;
						},
						getTrash: function () {
							return m;
						},
						restore: function () {
							return g;
						}
					});
				const a = i(r(8931)),
					n = i(r(1185)),
					u = r(7790),
					s = i(r(3664)),
					o = r(5840);
				function i(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const d = async () => {
						try {
							return await s.default.find().sort({ subjectName: 1 });
						} catch (e) {
							throw e;
						}
					},
					l = async (e) => {
						try {
							return await s.default.findById(e);
						} catch (e) {
							throw e;
						}
					},
					c = async (e) => {
						try {
							if (!e) throw (0, a.default)(HttpStatusCode.NO_CONTENT);
							let { error: t } = (0, o.validateSubjectRequestBody)(e);
							if (t) throw a.default.BadRequest(t.message);
							if (await f({ subjectName: e.subjectName })) throw a.default.Conflict('Subject already exists');
							return await new s.default(e).save();
						} catch (e) {
							throw e;
						}
					},
					f = async (e) => {
						try {
							if ('subjectName' in e) {
								e = { slug: (0, u.createSlug)(e.subjectName) };
							}
							return !!(await s.default.findOne(e));
						} catch (e) {
							throw e;
						}
					},
					p = async (e, t) => {
						try {
							if (!e) throw a.default.BadRequest('Missing parameter');
							if (0 === Object.keys(t).length) throw (0, a.default)(HttpStatusCode.NO_CONTENT);
							let { error: r } = (0, o.validateSubjectUpdateBody)(t);
							if (r) throw a.default.BadRequest(r.message);
							if (!n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the subject is invalid');
							if (!(await f({ _id: e }))) throw a.default.NotFound('Subject does not exist');
							if (t.subjectName) {
								let e = (0, u.createSlug)(t.subjectName);
								t = { ...t, slug: e };
							}
							return await s.default.findOneAndUpdate({ _id: e }, t, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					y = async (e) => {
						try {
							if (!n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the subject is invalid');
							return (
								await s.default.delete({ _id: e }),
								{
									message: 'Moved the class to the trash',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					h = async (e) => {
						try {
							if (!n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the subject is invalid');
							return (
								await s.default.deleteOne({ _id: e }),
								{
									message: 'Class has been permanently deleted',
									statusCode: 200
								}
							);
						} catch (e) {
							throw e;
						}
					},
					m = async () => {
						try {
							return await s.default.findWithDeleted({ deleted: !0 });
						} catch (e) {
							throw e;
						}
					},
					g = async (e) => {
						try {
							if (!n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('_id of the subject is invalid');
							return (
								await s.default.restore({ _id: e }),
								{
									message: 'Subject have been restored',
									statusCode: 201
								}
							);
						} catch (e) {
							throw e;
						}
					};
			},
			6950: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						newScoreList: function () {
							return p;
						},
						newScore: function () {
							return y;
						},
						selectSubjectTranscriptByClass: function () {
							return h;
						},
						selectTranscriptStudent: function () {
							return m;
						}
					});
				const a = f(r(8931)),
					n = f(r(1185)),
					u = f(r(3562)),
					s = f(r(3664)),
					o = f(r(4729)),
					i = r(7790),
					d = r(5690),
					l = f(r(2512)),
					c = r(254);
				function f(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const p = async (e, t, r) => {
						try {
							if (!n.default.Types.ObjectId.isValid(t) || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('classId or subjectId is not in the correct ObjectId format');
							if (!Array.isArray(r)) throw a.default.BadRequest('Body data must be an array');
							if (0 === r.length) throw (0, a.default)(304);
							let f = await (0, c.selectSchoolYearCurr)(),
								p = u.default.findOne({ _id: t }),
								y = s.default.findOne({ _id: e }),
								[h, m] = await Promise.all([p, y]);
							if (!h) throw a.default.NotFound('Class does not exist or has been deleted!');
							if (!m) throw a.default.NotFound('Subject does not exist or has been deleted!');
							let g = [];
							if (
								(r.forEach((e) => {
									let { error: t } = (0, d.validateSubjectTranscript)(e);
									t &&
										g.push({
											id: e.student.toString(),
											message: t.message
										});
								}),
								g.length > 0)
							)
								throw (0, a.default)(400, 'Transcript students fails to meet validation criteria!', {
									error: g
								});
							let O = [],
								b = (0, i.getPropertieOfArray)(r, 'student'),
								_ = await l.default
									.find({
										_id: { $in: b },
										class: t,
										transferSchool: null,
										dropoutDate: null
									})
									.select('fullName class')
									.lean();
							if (b.length > _.length)
								throw (
									(b.forEach((e) => {
										_.find((t) => t._id.toString() === e) || O.push({ id: e });
									}),
									(0, a.default)(404, 'Student do not exist in class!', { error: O }))
								);
							let w = [],
								E = await o.default
									.find({
										student: { $in: b },
										subject: e,
										schoolYear: f._id
									})
									.select('_id student')
									.lean();
							if (0 !== E.length && E.length < r.length) {
								r.forEach((e) => {
									E.find((t) => t.student.toString() === e.student.toString()) || w.push(e);
								});
								let t = E.map((t) => ({
										updateOne: {
											filter: {
												student: t.student,
												subject: e,
												schoolYear: f._id
											},
											update: r.find((e) => e.student.toString() === t.student.toString())
										}
									})),
									a = o.default.bulkWrite(t),
									n = w.map((t) => ({
										...t,
										subject: e,
										schoolYear: f._id
									})),
									u = o.default.insertMany(n);
								await Promise.all([a, u]);
							} else if (0 !== E.length && E.length === r.length) {
								let t = r.map((t) => ({
									updateOne: {
										filter: {
											student: t.student,
											subject: e,
											schoolYear: f._id
										},
										update: t
									}
								}));
								await o.default.bulkWrite(t);
							} else
								0 === E.length &&
									(await o.default.insertMany(
										r.map((t) => ({
											...t,
											subject: e,
											schoolYear: f._id
										}))
									));
							return {
								message: `Successfully inputted scores for subject ${m.subjectName} in class ${h.className}`
							};
						} catch (e) {
							throw e;
						}
					},
					y = async (e, t, r) => {
						try {
							if (!n.default.Types.ObjectId.isValid(t) || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('studentId or subjectId is not in the correct ObjectId format');
							if (!r || 0 === Object.keys(r).length) throw (0, a.default)(304);
							let u = await (0, c.selectSchoolYearCurr)(),
								i = l.default.findOne({ _id: t }),
								f = s.default.findOne({ _id: e }),
								[p, y] = await Promise.all([i, f]);
							if (!p) throw a.default.NotFound('Student does not exist or has been deleted!');
							if (!y) throw a.default.NotFound('Subject does not exist or has been deleted!');
							let { error: h } = (0, d.validateSubjectTranscriptOne)(r);
							if (h) throw a.default.BadRequest(h.message);
							let m = await o.default.findOne({
								student: t,
								subject: e,
								schoolYear: u._id
							});
							return m
								? await o.default.findOneAndUpdate({ _id: m._id }, r, {
										new: !0
								  })
								: await new o.default({
										...r,
										student: t,
										subject: e,
										schoolYear: u._id
								  }).save();
						} catch (e) {
							throw e;
						}
					},
					h = async (e, t) => {
						try {
							if (!(e && t && n.default.Types.ObjectId.isValid(e) && n.default.Types.ObjectId.isValid(t)))
								throw a.default.BadRequest('classId or subjectId is not in the correct ObjectId format');
							let r = await (0, c.selectSchoolYearCurr)(),
								u = await l.default
									.find({
										class: e,
										dropoutDate: null,
										transferSchool: null
									})
									.select('_id')
									.lean(),
								s = (0, i.getPropertieOfArray)(u, '_id');
							return await o.default.find({
								student: { $in: s },
								schoolYear: r._id,
								subject: t
							});
						} catch (e) {
							throw e;
						}
					},
					m = async (e) => {
						try {
							if (!e || !n.default.Types.ObjectId.isValid(e))
								throw a.default.BadRequest('id student is not in the correct ObjectId format');
							if (
								!(await l.default.findOne({
									_id: e,
									dropoutDate: null,
									transferSchool: null
								}))
							)
								throw a.default.NotFound('Student does not exist');
							let t = await (0, c.selectSchoolYearCurr)();
							return await o.default.find({ student: e, schoolYear: t._id }).select('-student');
						} catch (e) {
							throw e;
						}
					};
			},
			1177: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createTimetable: function () {
							return n;
						},
						updateTimetable: function () {
							return u;
						},
						deleteTimeTable: function () {
							return s;
						},
						getTimetableByClass: function () {
							return o;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(9374)),
					n = async (e) => {
						try {
							return await new a.default(e).save();
						} catch (e) {
							throw e;
						}
					},
					u = async ({ classId: e, payload: t }) => {
						try {
							return await a.default.findOneAndUpdate({ class: e }, t, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					s = async (e) => {
						try {
							return await a.default.findOneAndDelete({ class: e });
						} catch (e) {
							throw e;
						}
					},
					o = async (e) => {
						try {
							let t = await a.default.findOne({ class: e });
							return console.log(t), t;
						} catch (e) {
							throw e;
						}
					};
			},
			3019: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						createUser: function () {
							return c;
						},
						updateUserInfo: function () {
							return f;
						},
						updateTeacherInfo: function () {
							return p;
						},
						getUserDetails: function () {
							return y;
						},
						changePassword: function () {
							return h;
						},
						getTeacherUsersByStatus: function () {
							return m;
						},
						deactivateTeacherUser: function () {
							return g;
						},
						getParentsUserByClass: function () {
							return O;
						},
						searchParents: function () {
							return b;
						}
					});
				const a = r(7096),
					n = d(r(8931)),
					u = d(r(2512)),
					s = d(r(7130)),
					o = r(6880),
					i = d(r(9939));
				function d(e) {
					return e && e.__esModule ? e : { default: e };
				}
				const l = async ({ email: e, phone: t }) => {
						try {
							let [r, a] = await Promise.all([
								s.default.exists({ email: e, phone: t }),
								u.default.exists({ parentsPhoneNumber: t })
							]);
							return { isUserExisted: !!r, hasChildren: !!a };
						} catch (e) {
							throw e;
						}
					},
					c = async ({ payload: e, multi: t }) => {
						try {
							if (t && Array.isArray(e) && e.every((e) => e.role === o.UserRoleEnum.PARENTS))
								return (
									e.forEach((e) => {
										l({
											email: e.email ?? '',
											phone: e.phone ?? ''
										}).then((e) => {
											if (e.isUserExisted) throw n.default.Conflict('Parent account already existed!');
											if (!e.hasChildren)
												throw n.default.Conflict("No student has this parent's phone number!");
										});
									}),
									await s.default.insertMany(e)
								);
							if (e.role === o.UserRoleEnum.TEACHER) {
								if (
									await s.default.findOne({
										email: e.email,
										role: o.UserRoleEnum.TEACHER
									})
								)
									throw n.default.BadRequest('Teacher account already existed!');
								return await new s.default(e).save();
							}
						} catch (e) {
							throw e;
						}
					},
					f = async (e, t) => {
						try {
							return await s.default.findOneAndUpdate({ _id: e }, t, {
								new: !0
							});
						} catch (e) {
							throw e;
						}
					},
					p = async (e, t) => {
						try {
							return await s.default.findOneAndUpdate({ _id: e, role: o.UserRoleEnum.TEACHER }, t, { new: !0 });
						} catch (e) {
							throw e;
						}
					},
					y = async (e) => {
						try {
							return await s.default.findOne({ _id: e }).lean();
						} catch (e) {
							throw e;
						}
					},
					h = async (e, t) => {
						try {
							let r = (0, a.hashSync)(t, (0, a.genSaltSync)(+process.env.SALT_ROUND));
							return await s.default.findOneAndUpdate({ _id: e }, { password: r }, { new: !0 });
						} catch (e) {
							throw e;
						}
					},
					m = async (e) => {
						try {
							switch (e) {
								case 'inactive':
									return await s.default.find({
										role: o.UserRoleEnum.TEACHER,
										isVerified: !1
									});
								case 'in_working':
									return await s.default.find({
										role: o.UserRoleEnum.TEACHER,
										employmentStatus: !0
									});
								case 'quited':
									return await s.default.findWithDeleted({
										role: o.UserRoleEnum.TEACHER,
										deleted: !0,
										isVerified: !0,
										employmentStatus: !1
									});
								default:
									return await s.default.findWithDeleted({
										role: o.UserRoleEnum.TEACHER
									});
							}
						} catch (e) {
							throw e;
						}
					},
					g = async (e) => {
						try {
							return await s.default
								.findOneAndUpdate(
									{ _id: e, role: o.UserRoleEnum.TEACHER },
									{ employmentStatus: !1, deleted: !0 },
									{ new: !0 }
								)
								.lean();
						} catch (e) {
							throw e;
						}
					},
					O = async (e) => {
						try {
							return await s.default
								.find({ role: o.UserRoleEnum.PARENTS })
								.populate({
									path: 'children',
									select: 'fullName parentsPhoneNumber class',
									options: { id: !1 },
									match: {
										$and: [{ parentsPhoneNumber: { $exists: !0 } }, { class: e }]
									},
									populate: { path: 'class', select: 'className' }
								})
								.select('_id displayName email phone gender dateOfBirth')
								.lean();
						} catch (e) {
							throw e;
						}
					},
					b = async (e) => {
						try {
							console.log(e);
							let t = RegExp(`^${e}`, 'gi');
							return await s.default
								.find({
									$or: [
										{ phone: t, role: o.UserRoleEnum.PARENTS },
										{
											displayName: (0, i.default)(e),
											role: o.UserRoleEnum.PARENTS
										},
										{ email: t, role: o.UserRoleEnum.PARENTS }
									]
								})
								.lean();
						} catch (e) {
							throw e;
						}
					};
			},
			6813: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateClassData: function () {
							return n;
						},
						validateArrayOfClassData: function () {
							return u;
						},
						validateClassEditData: function () {
							return s;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = (e) => {
						let t = RegExp(`^${e.grade}[a-zA-Z]$`);
						return a.default
							.object({
								className: a.default.string().required().pattern(t),
								headTeacher: a.default.string().required(),
								grade: a.default.number().required().valid(1, 2, 3, 4, 5)
							})
							.validate(e);
					},
					u = (e) => {
						let t = RegExp(`^${e.grade}[a-zA-Z]$`);
						return a.default
							.array()
							.items(
								a.default.object({
									className: a.default.string().required().pattern(t),
									headTeacher: a.default.string().required(),
									grade: a.default.number().required().valid(1, 2, 3, 4, 5)
								})
							)
							.validate(e);
					},
					s = (e) => {
						let t = e.grade ? RegExp(`^${e.grade}[a-zA-Z]$`) : /^[1-5][a-zA-Z]$/;
						return a.default
							.object({
								className: a.default.string().required().pattern(t).optional(),
								headTeacher: a.default.string().required().optional(),
								grade: a.default.number().required().valid(1, 2, 3, 4, 5).optional()
							})
							.validate(e);
					};
			},
			7848: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'checkValidMimeType', {
						enumerable: !0,
						get: function () {
							return n;
						}
					});
				const a = r(6468),
					n = (e) => Object.values(a.AllowedMimeType).includes(e.mimetype);
			},
			8719: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'validatePermissionData', {
						enumerable: !0,
						get: function () {
							return s;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = r(8324),
					u = r(6880),
					s = (e) =>
						a.default
							.object({
								role: a.default
									.string()
									.valid(...Object.values(u.UserRoleEnum))
									.required(),
								permissions: a.default
									.array()
									.items(
										a.default.object({
											type: a.default.string().required(),
											allowedActions: a.default.array().items(
												a.default
													.string()
													.valid(...Object.values(n.PermissionActionsEnum))
													.required()
											)
										})
									)
									.default([])
							})
							.validate(e);
			},
			4581: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'checkIsValidSortObject', {
						enumerable: !0,
						get: function () {
							return n;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = (e) =>
						a.default
							.object({
								_sort: a.default.string().required(),
								_order: a.default.string().required()
							})
							.validate(e);
			},
			530: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateReqBodyStudent: function () {
							return n;
						},
						validateAttendanceStudent: function () {
							return u;
						},
						validateUpdateReqBodyStudent: function () {
							return s;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = (e) =>
						a.default
							.object({
								class: a.default.string().required(),
								code: a.default.string().required(),
								fullName: a.default.string().required().min(6).max(100),
								gender: a.default.bool().required(),
								dateOfBirth: a.default.date().required(),
								parentsPhoneNumber: a.default
									.string()
									.required()
									.pattern(/^(?:\+84|0)(?:1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/),
								isPolicyBeneficiary: a.default.bool().optional(),
								isGraduated: a.default.bool().optional()
							})
							.validate(e),
					u = (e) =>
						a.default
							.object({
								hasPermision: a.default.bool().optional(),
								reason: a.default.string().min(8).max(256).optional()
							})
							.validate(e),
					s = (e) =>
						a.default
							.object({
								class: a.default.string().required().optional(),
								code: a.default.string().required().optional(),
								fullName: a.default.string().required().min(6).max(100).optional(),
								gender: a.default.bool().required().optional(),
								dateOfBirth: a.default.date().required().optional(),
								parentsPhoneNumber: a.default
									.string()
									.required()
									.optional()
									.pattern(/^(?:\+84|0)(?:1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/),
								isPolicyBeneficiary: a.default.bool().optional(),
								isGraduated: a.default.bool().optional()
							})
							.validate(e);
			},
			5840: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateSubjectRequestBody: function () {
							return n;
						},
						validateSubjectUpdateBody: function () {
							return u;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = (e) =>
						a.default
							.object({
								subjectName: a.default.string().required().min(3).max(50)
							})
							.validate(e),
					u = (e) =>
						a.default
							.object({
								subjectName: a.default.string().required().min(3).max(50).optional()
							})
							.validate(e);
			},
			5690: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateSubjectTranscript: function () {
							return n;
						},
						validateSubjectTranscriptOne: function () {
							return u;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = (e) =>
						a.default
							.object({
								student: a.default.string().required(),
								firstSemester: a.default
									.object({
										midtermTest: a.default.number().required().min(0).max(10),
										finalTest: a.default.number().required().min(0).max(10)
									})
									.optional(),
								secondSemester: a.default
									.object({
										midtermTest: a.default.number().required().min(0).max(10),
										finalTest: a.default.number().required().min(0).max(10)
									})
									.optional()
							})
							.validate(e),
					u = (e) =>
						a.default
							.object({
								firstSemester: a.default
									.object({
										midtermTest: a.default.number().required().min(0).max(10),
										finalTest: a.default.number().required().min(0).max(10)
									})
									.optional(),
								secondSemester: a.default
									.object({
										midtermTest: a.default.number().required().min(0).max(10),
										finalTest: a.default.number().required().min(0).max(10)
									})
									.optional()
							})
							.validate(e);
			},
			9868: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateNewTimeTable: function () {
							return u;
						},
						validateUpdateTimeTablePayload: function () {
							return s;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = a.default.object({
						period: a.default.number().integer().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).required(),
						subject: a.default.string().required(),
						teacher: a.default.string().required()
					}),
					u = (e) =>
						a.default
							.object({
								class: a.default.string().required(),
								schedule: a.default
									.object({
										monday: a.default.array().unique('period').items(n).required(),
										tuesday: a.default.array().unique('period').items(n).required(),
										wednesday: a.default.array().unique('period').items(n).required(),
										thursday: a.default.array().unique('period').items(n).required(),
										friday: a.default.array().unique('period').items(n).required(),
										saturday: a.default.array().unique('period').items(n).required()
									})
									.required()
							})
							.validate(e),
					s = (e) =>
						a.default
							.object({
								class: a.default.string(),
								schedule: a.default
									.object({
										monday: a.default.array().unique('period').items(n).required(),
										tuesday: a.default.array().unique('period').items(n).required(),
										wednesday: a.default.array().unique('period').items(n).required(),
										thursday: a.default.array().unique('period').items(n).required(),
										friday: a.default.array().unique('period').items(n).required(),
										saturday: a.default.array().unique('period').items(n).required()
									})
									.required()
							})
							.validate(e);
			},
			3326: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						validateSigninData: function () {
							return u;
						},
						validateNewTeacherData: function () {
							return s;
						},
						validateNewParentsData: function () {
							return o;
						},
						validateUpdateUserData: function () {
							return i;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8506)),
					n = r(6880),
					u = (e) =>
						a.default
							.object({
								phone: a.default
									.alternatives()
									.try(
										a.default
											.string()
											.lowercase()
											.email({
												minDomainSegments: 2,
												tlds: { allow: ['com'] }
											}),
										a.default.string().alphanum().min(3).max(30)
									)
									.required()
									.error(Error('Invalid email or userName')),
								password: a.default.string().min(6).max(32).required()
							})
							.validate(e),
					s = (e) =>
						a.default
							.object({
								email: a.default
									.string()
									.email({ tlds: { allow: !0 } })
									.regex(/^[\w.+\-]+@gmail\.com$/)
									.required()
									.messages({
										'object.regex': 'Email must be a valid Gmail address !'
									}),
								password: a.default.string().min(6).max(24),
								displayName: a.default.string().required(),
								dateOfBirth: a.default.date().required(),
								phone: a.default.string().min(10).max(11).required(),
								gender: a.default
									.string()
									.required()
									.valid(...Object.values(n.UserGenderEnum)),
								eduBackground: a.default.object({
									universityName: a.default.string().required(),
									graduatedAt: a.default.date().required(),
									qualification: a.default.string().required()
								})
							})
							.validate(e),
					o = ({ payload: e, multi: t }) => {
						let r = a.default.object({
								email: a.default
									.string()
									.email()
									.regex(/^[\w.+\-]+@gmail\.com$/)
									.required()
									.messages({
										'string.pattern.base': 'User email must be a valid Gmail address !'
									}),
								phone: a.default.string().length(10).required(),
								displayName: a.default.string().required(),
								dateOfBirth: a.default.date().required(),
								gender: a.default.string().required()
							}),
							n = a.default
								.array()
								.items(r)
								.unique((e, t) => e.phone === t.phone);
						return t ? n.validate(e) : r.validate(e);
					},
					i = (e) =>
						a.default
							.object({
								displayName: a.default.string().optional(),
								dateOfBirth: a.default.date().optional(),
								gender: a.default.string().optional(),
								picture: a.default.string().optional(),
								eduBackground: a.default
									.object({
										universityName: a.default.string().required(),
										graduatedAt: a.default.date().required(),
										qualification: a.default.string().required()
									})
									.optional()
							})
							.validate(e);
			},
			4559: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return b;
						}
					});
				const a = h(r(9710)),
					n = h(r(3582));
				r(1081);
				const u = h(r(6860)),
					s = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = m(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var u in e)
							if ('default' !== u && Object.prototype.hasOwnProperty.call(e, u)) {
								var s = n ? Object.getOwnPropertyDescriptor(e, u) : null;
								s && (s.get || s.set) ? Object.defineProperty(a, u, s) : (a[u] = e[u]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(6508)),
					o = h(r(7806)),
					i = h(r(9470)),
					d = h(r(3511));
				r(4235), r(3671);
				const l = h(r(9948)),
					c = h(r(8664)),
					f = h(r(1017)),
					p = h(r(2852)),
					y = h(r(2057));
				function h(e) {
					return e && e.__esModule ? e : { default: e };
				}
				function m(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (m = function (e) {
						return e ? r : t;
					})(e);
				}
				const g = f.default.join(__dirname, '..');
				f.default.join(g, 'src');
				const O = (0, u.default)();
				O.use(u.default.json()),
					O.use(
						(0, o.default)({
							contentSecurityPolicy: {
								useDefaults: !1,
								directives: {
									...o.default.contentSecurityPolicy.getDefaultDirectives(),
									'style-src': ["'self'", "'unsafe-inline'", y.default.BOOTSTRAP_ICONS_CDN],
									'script-src': ["'self'", "'unsafe-inline'", y.default.TAILWIND_CDN]
								}
							}
						})
					),
					O.use((0, i.default)('tiny')),
					O.use((0, a.default)()),
					O.use(
						(0, s.default)({
							saveUninitialized: !1,
							secret: y.default.KEY_SESSION,
							store: new s.MemoryStore(),
							resave: !0
						})
					),
					O.use(
						(0, n.default)({
							origin: y.default.CLIENT_URL,
							credentials: !0,
							methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
						})
					),
					O.use(d.default.initialize()),
					O.use(d.default.session()),
					O.use('/api', p.default),
					O.use('/api/document', l.default.serve, l.default.setup(c.default)),
					O.get('*', async (e, t) => t.redirect('/api/document'));
				const b = O;
			},
			2057: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return n;
						}
					}),
					r(1081);
				const a = 'production'?.includes('production'),
					n = {
						PORT: process.env.PORT || 3001,
						KEY_SESSION: process.env.KEY_SESSION,
						CLIENT_URL: a ? process.env.FRONTEND_URL : process.env.LOCAL_FRONTEND_URL,
						MONGO_URI: a ? process.env.MAIN_DB_URI : process.env.TEST_DB_URI,
						TAILWIND_CDN: 'https://cdn.tailwindcss.com',
						BOOTSTRAP_ICONS_CDN: 'https://cdn.tailwindcss.com'
					};
			},
			582: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						oauth2Client: function () {
							return d;
						},
						baseDownloadUrl: function () {
							return c;
						},
						drive: function () {
							return l;
						}
					});
				const a = r(9993);
				r(1081);
				const {
						GOOGLE_CLIENT_ID: n,
						GOOGLE_CLIENT_SECRET: u,
						GOOGLE_API_REFRESH_TOKEN: s,
						REDIRECT_URI: o,
						GOOGLE_API_KEY: i
					} = process.env,
					d = new a.google.auth.OAuth2(n, u, o);
				d.setCredentials({ refresh_token: s }), d.getAccessToken();
				const l = a.google.drive({ version: 'v3', auth: d }),
					c = 'https://drive.google.com/uc?export=download&id=';
			},
			5103: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return a;
						}
					}),
					r(1081);
				const a = (function (e) {
					return e && e.__esModule ? e : { default: e };
				})(r(5184)).default.createTransport({
					service: 'gmail',
					port: 465,
					auth: {
						user: process.env.AUTH_EMAIL,
						pass: process.env.AUTH_PASSWORD
					},
					tls: { rejectUnauthorized: !1 }
				});
			},
			2109: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'redisOptions', {
						enumerable: !0,
						get: function () {
							return a;
						}
					}),
					r(1081);
				const a = {
					password: process.env.REDIS_PASSWORD,
					socket: {
						host: process.env.REDIS_HOST,
						port: +process.env.REDIS_PORT,
						noDelay: !1,
						keepAlive: -1,
						connectionTimeOut: 5e3
					}
				};
			},
			1921: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return u;
						}
					}),
					r(1081);
				const a = r(7601),
					n = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(1017)),
					u = new a.Vonage({
						apiKey: process.env.SMS_API_KEY,
						apiSecret: process.env.SMS_API_SECRET,
						applicationId: process.env.SMS_API_APP_ID,
						privateKey: n.default.resolve('/private.key')
					});
			},
			1548: (e, t) => {
				var r;
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'HttpStatusCode', {
						enumerable: !0,
						get: function () {
							return r;
						}
					}),
					(function (e) {
						(e[(e.CONTINUE = 100)] = 'CONTINUE'),
							(e[(e.SWITCHING_PROTOCOLS = 101)] = 'SWITCHING_PROTOCOLS'),
							(e[(e.PROCESSING = 102)] = 'PROCESSING'),
							(e[(e.OK = 200)] = 'OK'),
							(e[(e.CREATED = 201)] = 'CREATED'),
							(e[(e.ACCEPTED = 202)] = 'ACCEPTED'),
							(e[(e.NON_AUTHORITATIVE_INFORMATION = 203)] = 'NON_AUTHORITATIVE_INFORMATION'),
							(e[(e.NO_CONTENT = 204)] = 'NO_CONTENT'),
							(e[(e.RESET_CONTENT = 205)] = 'RESET_CONTENT'),
							(e[(e.PARTIAL_CONTENT = 206)] = 'PARTIAL_CONTENT'),
							(e[(e.MULTI_STATUS = 207)] = 'MULTI_STATUS'),
							(e[(e.MULTIPLE_CHOICES = 300)] = 'MULTIPLE_CHOICES'),
							(e[(e.MOVED_PERMANENTLY = 301)] = 'MOVED_PERMANENTLY'),
							(e[(e.MOVED_TEMPORARILY = 302)] = 'MOVED_TEMPORARILY'),
							(e[(e.SEE_OTHER = 303)] = 'SEE_OTHER'),
							(e[(e.NOT_MODIFIED = 304)] = 'NOT_MODIFIED'),
							(e[(e.USE_PROXY = 305)] = 'USE_PROXY'),
							(e[(e.TEMPORARY_REDIRECT = 307)] = 'TEMPORARY_REDIRECT'),
							(e[(e.PERMANENT_REDIRECT = 308)] = 'PERMANENT_REDIRECT'),
							(e[(e.BAD_REQUEST = 400)] = 'BAD_REQUEST'),
							(e[(e.UNAUTHORIZED = 401)] = 'UNAUTHORIZED'),
							(e[(e.PAYMENT_REQUIRED = 402)] = 'PAYMENT_REQUIRED'),
							(e[(e.FORBIDDEN = 403)] = 'FORBIDDEN'),
							(e[(e.NOT_FOUND = 404)] = 'NOT_FOUND'),
							(e[(e.METHOD_NOT_ALLOWED = 405)] = 'METHOD_NOT_ALLOWED'),
							(e[(e.NOT_ACCEPTABLE = 406)] = 'NOT_ACCEPTABLE'),
							(e[(e.PROXY_AUTHENTICATION_REQUIRED = 407)] = 'PROXY_AUTHENTICATION_REQUIRED'),
							(e[(e.REQUEST_TIMEOUT = 408)] = 'REQUEST_TIMEOUT'),
							(e[(e.CONFLICT = 409)] = 'CONFLICT'),
							(e[(e.GONE = 410)] = 'GONE'),
							(e[(e.LENGTH_REQUIRED = 411)] = 'LENGTH_REQUIRED'),
							(e[(e.PRECONDITION_FAILED = 412)] = 'PRECONDITION_FAILED'),
							(e[(e.REQUEST_TOO_LONG = 413)] = 'REQUEST_TOO_LONG'),
							(e[(e.REQUEST_URI_TOO_LONG = 414)] = 'REQUEST_URI_TOO_LONG'),
							(e[(e.UNSUPPORTED_MEDIA_TYPE = 415)] = 'UNSUPPORTED_MEDIA_TYPE'),
							(e[(e.REQUESTED_RANGE_NOT_SATISFIABLE = 416)] = 'REQUESTED_RANGE_NOT_SATISFIABLE'),
							(e[(e.EXPECTATION_FAILED = 417)] = 'EXPECTATION_FAILED'),
							(e[(e.IM_A_TEAPOT = 418)] = 'IM_A_TEAPOT'),
							(e[(e.INSUFFICIENT_SPACE_ON_RESOURCE = 419)] = 'INSUFFICIENT_SPACE_ON_RESOURCE'),
							(e[(e.METHOD_FAILURE = 420)] = 'METHOD_FAILURE'),
							(e[(e.MISDIRECTED_REQUEST = 421)] = 'MISDIRECTED_REQUEST'),
							(e[(e.UNPROCESSABLE_ENTITY = 422)] = 'UNPROCESSABLE_ENTITY'),
							(e[(e.LOCKED = 423)] = 'LOCKED'),
							(e[(e.FAILED_DEPENDENCY = 424)] = 'FAILED_DEPENDENCY'),
							(e[(e.PRECONDITION_REQUIRED = 428)] = 'PRECONDITION_REQUIRED'),
							(e[(e.TOO_MANY_REQUESTS = 429)] = 'TOO_MANY_REQUESTS'),
							(e[(e.REQUEST_HEADER_FIELDS_TOO_LARGE = 431)] = 'REQUEST_HEADER_FIELDS_TOO_LARGE'),
							(e[(e.UNAVAILABLE_FOR_LEGAL_REASONS = 451)] = 'UNAVAILABLE_FOR_LEGAL_REASONS'),
							(e[(e.INTERNAL_SERVER_ERROR = 500)] = 'INTERNAL_SERVER_ERROR'),
							(e[(e.NOT_IMPLEMENTED = 501)] = 'NOT_IMPLEMENTED'),
							(e[(e.BAD_GATEWAY = 502)] = 'BAD_GATEWAY'),
							(e[(e.SERVICE_UNAVAILABLE = 503)] = 'SERVICE_UNAVAILABLE'),
							(e[(e.GATEWAY_TIMEOUT = 504)] = 'GATEWAY_TIMEOUT'),
							(e[(e.HTTP_VERSION_NOT_SUPPORTED = 505)] = 'HTTP_VERSION_NOT_SUPPORTED'),
							(e[(e.INSUFFICIENT_STORAGE = 507)] = 'INSUFFICIENT_STORAGE'),
							(e[(e.NETWORK_AUTHENTICATION_REQUIRED = 511)] = 'NETWORK_AUTHENTICATION_REQUIRED');
					})(r || (r = {}));
			},
			8664: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return a;
						}
					});
				const a = (0,
				(function (e) {
					return e && e.__esModule ? e : { default: e };
				})(r(7777)).default)({
					definition: {
						openapi: '3.0.0',
						basePath: '/api',
						servers: [
							{
								url: 'http://localhost:3001/api',
								description: 'Development API'
							},
							{
								url: 'https://education-management-backend.vercel.app',
								description: 'Production API'
							}
						],
						info: {
							title: 'APIs Documentation',
							version: '1.0.0',
							description: 'Documentation for all endpoints'
						}
					},
					apis: ['src/docs/**/*.yaml']
				});
			},
			8438: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return n;
						}
					});
				const a = (function (e) {
					return e && e.__esModule ? e : { default: e };
				})(r(1185));
				r(1081);
				const n = async () => {
					try {
						a.default.set('strictQuery', !1);
						let e = 'production'?.includes('production');
						e
							? console.log('[INFO] ::: Environment -> Production')
							: console.log('[INFO] ::: Environment -> Development');
						let t = e ? process.env.MAIN_DB_URI : process.env.TEST_DB_URI,
							r = await a.default.connect(t);
						return console.log('[SUCCESS] ::: Connected to database'), r;
					} catch (e) {
						console.log('[ERROR] ::: ', e.message);
					}
				};
			},
			9123: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return o;
						}
					}),
					r(1081);
				const a = (function (e, t) {
						if (e && e.__esModule) return e;
						if (null === e || ('object' != typeof e && 'function' != typeof e)) return { default: e };
						var r = u(t);
						if (r && r.has(e)) return r.get(e);
						var a = {},
							n = Object.defineProperty && Object.getOwnPropertyDescriptor;
						for (var s in e)
							if ('default' !== s && Object.prototype.hasOwnProperty.call(e, s)) {
								var o = n ? Object.getOwnPropertyDescriptor(e, s) : null;
								o && (o.get || o.set) ? Object.defineProperty(a, s, o) : (a[s] = e[s]);
							}
						return (a.default = e), r && r.set(e, a), a;
					})(r(7773)),
					n = r(2109);
				function u(e) {
					if ('function' != typeof WeakMap) return null;
					var t = new WeakMap(),
						r = new WeakMap();
					return (u = function (e) {
						return e ? r : t;
					})(e);
				}
				const s = a.createClient(n.redisOptions);
				s
					.connect()
					.then(() => {
						console.log('[SUCCESS] ::: Connected to Redis');
					})
					.catch((e) => {
						console.log('[ERROR] ::: ', e.message);
					}),
					s.on('error', (e) => {
						console.log(e.message);
					});
				const o = s;
			},
			2076: (e, t) => {
				function r(e) {
					return '84' + e.slice(1);
				}
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return r;
						}
					});
			},
			1261: (e, t) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return r;
						}
					});
				const r = () => Math.floor(1e6 * Math.random()).toString();
			},
			2407: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						paramsStringify: function () {
							return n;
						},
						multiFieldSortObjectParser: function () {
							return u;
						}
					});
				const a = r(4581),
					n = (e) =>
						e
							? '?' +
							  Object.keys(e)
									.map((t) => t + '=' + encodeURIComponent(e[t]))
									.join('&')
							: '',
					u = (e) => {
						try {
							if (!e) return;
							let { error: t } = (0, a.checkIsValidSortObject)(e);
							if ((console.log(t?.message), t)) return;
							let r = e._sort.split(','),
								n = e._order.split(',');
							return r.reduce((e, t, r) => ((e[t] = n[r]), e), {});
						} catch (e) {
							throw e;
						}
					};
			},
			7790: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						compareObject: function () {
							return n;
						},
						sortArrayByLetter: function () {
							return u;
						},
						getPropertieOfArray: function () {
							return s;
						},
						createSlug: function () {
							return o;
						},
						compareDates: function () {
							return i;
						},
						formatDate: function () {
							return d;
						},
						toCapitalize: function () {
							return l;
						}
					});
				const a = (function (e) {
						return e && e.__esModule ? e : { default: e };
					})(r(8931)),
					n = (e, t) => {
						let r = u(Object.keys(e)),
							a = u(Object.keys(t));
						if (r.length !== a.length) return !1;
						let n = r.reduce((r, n) => r && a.includes(n) && t[n] === e[n], !0);
						return n;
					};
				function u(e) {
					return e.sort(function (e, t) {
						return e < t ? -1 : e > t ? 1 : 0;
					});
				}
				function s(e, t) {
					return e.map((e) => {
						if (!e[t]) throw a.default.BadGateway(`Propertie ${t} does not exist in data`);
						return e[t];
					});
				}
				function o(e) {
					return (e = (e = (e = (e = (e = (e = (e = (e = e.toLowerCase().trim()).replace(
						/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,
						'a'
					)).replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')).replace(/ì|í|ị|ỉ|ĩ/g, 'i')).replace(
						/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,
						'o'
					)).replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')).replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')).replace(/đ/g, 'd')).replace(
						/\s+/g,
						'-'
					);
				}
				const i = (e, t) => {
						try {
							let r = new Date(d(e)),
								a = new Date(d(t));
							return r.getTime() === a.getTime() ? 0 : r.getTime() > a.getTime() ? 1 : -1;
						} catch (e) {
							throw e;
						}
					},
					d = (e) => {
						try {
							let t = '' + (e.getMonth() + 1),
								r = '' + e.getDate(),
								a = e.getFullYear();
							return t.length < 2 && (t = '0' + t), r.length < 2 && (r = '0' + r), [t, r, a].join('-');
						} catch (e) {
							throw e;
						}
					},
					l = (e) => {
						if (!e || 'string' != typeof e) return;
						let t = (e = e.trim().replace(/\s+/g, ' '))
							.split(' ')
							.map((e) => e.at(0).toUpperCase() + e.slice(1).toLowerCase())
							.join(' ');
						return t;
					};
			},
			9939: (e, t) => {
				function r(e) {
					return (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e =
						e.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')).replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')).replace(
						/ì|í|ị|ỉ|ĩ/g,
						'i'
					)).replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')).replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')).replace(
						/ỳ|ý|ỵ|ỷ|ỹ/g,
						'y'
					)).replace(/đ/g, 'd')).replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')).replace(
						/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g,
						'E'
					)).replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')).replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')).replace(
						/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g,
						'U'
					)).replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')).replace(/Đ/g, 'D')).replace(
						/\u0300|\u0301|\u0303|\u0309|\u0323/g,
						''
					)).replace(/\u02C6|\u0306|\u031B/g, '')).replace(/ + /g, ' ')).trim()).replace(
						/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
						' '
					);
				}
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'default', {
						enumerable: !0,
						get: function () {
							return r;
						}
					});
			},
			1746: (e, t) => {
				Object.defineProperty(t, '__esModule', { value: !0 });
			},
			2116: (e, t, r) => {
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'HttpException', {
						enumerable: !0,
						get: function () {
							return o;
						}
					});
				const a = r(8931),
					n = r(1548),
					u = r(9344);
				function s(e, t, r) {
					return (
						t in e
							? Object.defineProperty(e, t, {
									value: r,
									enumerable: !0,
									configurable: !0,
									writable: !0
							  })
							: (e[t] = r),
						e
					);
				}
				class o {
					constructor(e) {
						s(this, 'message', void 0),
							s(this, 'statusCode', void 0),
							(this.message = e.message),
							(this.statusCode = (0, a.isHttpError)(e)
								? e.status
								: e instanceof u.JsonWebTokenError
								? n.HttpStatusCode.UNAUTHORIZED
								: n.HttpStatusCode.INTERNAL_SERVER_ERROR);
					}
				}
			},
			6468: (e, t) => {
				var r;
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'AllowedMimeType', {
						enumerable: !0,
						get: function () {
							return r;
						}
					}),
					(function (e) {
						(e.MS_POWERPOINT = 'application/vnd.ms-powerpoint'),
							(e.MS_EXCEL = 'application/vnd.ms-excel'),
							(e.MS_WORD = 'application/msword'),
							(e.POWERPOINT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
							(e.EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
							(e.WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
							(e.PDF = 'application/pdf'),
							(e.ZIP = 'application/zip'),
							(e.RAR = 'application/vnd.rar'),
							(e.PNG = 'image/png'),
							(e.JPG = 'image/jpeg');
					})(r || (r = {}));
			},
			8324: (e, t) => {
				var r;
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'PermissionActionsEnum', {
						enumerable: !0,
						get: function () {
							return r;
						}
					}),
					(function (e) {
						(e.GET = 'GET'), (e.CREATE = 'CREATE'), (e.UPDATE = 'UPDATE'), (e.DELETE = 'DELETE');
					})(r || (r = {}));
			},
			3111: (e, t) => {
				var r;
				Object.defineProperty(t, '__esModule', { value: !0 }),
					Object.defineProperty(t, 'AuthRedisKeyPrefix', {
						enumerable: !0,
						get: function () {
							return r;
						}
					}),
					(function (e) {
						(e.ACCESS_TOKEN = '[AT]-'), (e.REFRESH_TOKEN = '[RT]-'), (e.OTP_KEY = '[OTP]-');
					})(r || (r = {}));
			},
			6880: (e, t) => {
				var r, a;
				Object.defineProperty(t, '__esModule', { value: !0 }),
					(function (e, t) {
						for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
					})(t, {
						UserGenderEnum: function () {
							return r;
						},
						UserRoleEnum: function () {
							return a;
						}
					}),
					(function (e) {
						(e.MALE = 'Nam'), (e.FEMALE = 'Nữ');
					})(r || (r = {})),
					(function (e) {
						(e.HEADMASTER = 'Headmaster'), (e.TEACHER = 'Teacher'), (e.PARENTS = 'Parents');
					})(a || (a = {}));
			},
			7601: (e) => {
				e.exports = require('@vonage/server-sdk');
			},
			7096: (e) => {
				e.exports = require('bcrypt');
			},
			9710: (e) => {
				e.exports = require('cookie-parser');
			},
			3582: (e) => {
				e.exports = require('cors');
			},
			1081: (e) => {
				e.exports = require('dotenv/config');
			},
			6860: (e) => {
				e.exports = require('express');
			},
			6508: (e) => {
				e.exports = require('express-session');
			},
			9993: (e) => {
				e.exports = require('googleapis');
			},
			7806: (e) => {
				e.exports = require('helmet');
			},
			8931: (e) => {
				e.exports = require('http-errors');
			},
			8506: (e) => {
				e.exports = require('joi');
			},
			9344: (e) => {
				e.exports = require('jsonwebtoken');
			},
			1185: (e) => {
				e.exports = require('mongoose');
			},
			314: (e) => {
				e.exports = require('mongoose-autopopulate');
			},
			3760: (e) => {
				e.exports = require('mongoose-delete');
			},
			2365: (e) => {
				e.exports = require('mongoose-lean-virtuals');
			},
			8037: (e) => {
				e.exports = require('mongoose-paginate-v2');
			},
			9470: (e) => {
				e.exports = require('morgan');
			},
			1738: (e) => {
				e.exports = require('multer');
			},
			5184: (e) => {
				e.exports = require('nodemailer');
			},
			3511: (e) => {
				e.exports = require('passport');
			},
			8117: (e) => {
				e.exports = require('passport-google-oauth2');
			},
			7055: (e) => {
				e.exports = require('passport-local');
			},
			7773: (e) => {
				e.exports = require('redis');
			},
			7777: (e) => {
				e.exports = require('swagger-jsdoc');
			},
			9948: (e) => {
				e.exports = require('swagger-ui-express');
			},
			3685: (e) => {
				e.exports = require('http');
			},
			1017: (e) => {
				e.exports = require('path');
			},
			2781: (e) => {
				e.exports = require('stream');
			}
		},
		t = {};
	function r(a) {
		var n = t[a];
		if (void 0 !== n) return n.exports;
		var u = (t[a] = { exports: {} });
		return e[a](u, u.exports, r), u.exports;
	}
	(() => {
		const e = n(r(4559));
		r(1081);
		const t = n(r(3685)),
			a = n(r(8438));
		function n(e) {
			return e && e.__esModule ? e : { default: e };
		}
		r(9123), r(1746);
		const u = t.default.createServer(e.default),
			s = process.env.PORT || 3004;
		u.listen(s, () => {
			console.log(`[SUCCESS] ::: Server is listening on port: ${s}`),
				console.log(`[INFO] ::: API document available on: http://localhost:${s}/api/document`);
		}),
			(0, a.default)();
	})();
})();
